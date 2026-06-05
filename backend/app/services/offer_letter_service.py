from pypdf import PdfWriter, PdfReader
from typing import Optional
import os
import shutil
import tempfile
import zipfile
import re
import copy
import defusedxml.ElementTree as ET
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse, unquote
from urllib.request import urlopen
from app.schemas import OfferLetterRequest, SalaryBreakdown
from app.config import settings
from docxtpl import DocxTemplate
from num2words import num2words
from azure.communication.email import EmailClient
import subprocess  # nosec B404
from azure.storage.blob import BlobClient

ACS_CONNECTION_STRING = settings.ACS_CONNECTION_STRING
ACS_SENDER_ADDRESS = settings.ACS_SENDER_ADDRESS
AZURE_STORAGE_CONNECTION_STRING = settings.AZURE_STORAGE_CONNECTION_STRING
AZURE_STORAGE_CONTAINER = settings.AZURE_STORAGE_CONTAINER
AZURE_STORAGE_SAS_URL = settings.AZURE_STORAGE_SAS_URL

W_T_PATH = ".//w:t"

def _norm_key(raw: str) -> str:
    return re.sub(r"\s+", "_", (raw or "").strip())

def _to_scalar_string(value) -> str:
    if value is None or isinstance(value, (dict, list, tuple, set)):
        return ""
    return str(value)

def _normalize_placeholder_delimiters(text: str) -> str:
    return (
        text.replace("\u00C2\u00AB", "\u00AB")
        .replace("\u00C2\u00BB", "\u00BB")
        .replace("Ť", "\u00AB")
        .replace("ť", "\u00BB")
    )

def _resolve_lookup_value(raw_key: str, lookup: dict, legacy_aliases: dict) -> str | None:
    key = raw_key.strip()
    for candidate in (
        key,
        legacy_aliases.get(key, ""),
        _norm_key(key),
        legacy_aliases.get(_norm_key(key), ""),
    ):
        if candidate and candidate in lookup:
            return lookup[candidate]
    return None

def _replace_token(token_text: str, lookup: dict, legacy_aliases: dict) -> str:
    resolved = _resolve_lookup_value(token_text, lookup, legacy_aliases)
    return resolved if resolved is not None else token_text

def _replace_placeholders_in_text(text: str, lookup: dict, legacy_aliases: dict) -> str:
    normalized = _normalize_placeholder_delimiters(text)
    normalized = re.sub(
        r"<<\s*([^<>]{1,120}?)\s*>>",
        lambda m: _replace_token(m.group(1), lookup, legacy_aliases),
        normalized,
    )
    normalized = re.sub(
        r"\u00AB\s*([^\u00BB]{1,120}?)\s*\u00BB",
        lambda m: _replace_token(m.group(1), lookup, legacy_aliases),
        normalized,
    )
    return normalized

def _replace_placeholder_runs_in_xml(xml_text: str, lookup: dict, legacy_aliases: dict) -> str:
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return _replace_placeholders_in_text(xml_text, lookup, legacy_aliases)

    for paragraph in root.findall(".//w:p", ns):
        children = list(paragraph)
        field_begin_idx = None
        field_separate_idx = None
        idx = 0
        while idx < len(children):
            child = children[idx]
            fld_char = child.find("w:fldChar", ns)
            if fld_char is not None:
                fld_type = fld_char.attrib.get(f"{{{ns['w']}}}fldCharType")
                if fld_type == "begin":
                    field_begin_idx = idx
                    field_separate_idx = None
                elif fld_type == "separate" and field_begin_idx is not None:
                    field_separate_idx = idx
                elif (
                    fld_type == "end"
                    and field_begin_idx is not None
                    and field_separate_idx is not None
                ):
                    result_runs = children[field_separate_idx + 1:idx]
                    result_text_nodes = []
                    replacement_run = None
                    for run in result_runs:
                        texts = run.findall(W_T_PATH, ns)
                        if texts:
                            result_text_nodes.extend(texts)
                            replacement_run = replacement_run or copy.deepcopy(run)

                    combined = "".join(node.text or "" for node in result_text_nodes)
                    replaced = _replace_placeholders_in_text(combined, lookup, legacy_aliases)
                    if replaced != combined and replacement_run is not None:
                        replacement_text_nodes = replacement_run.findall(W_T_PATH, ns)
                        if replacement_text_nodes:
                            replacement_text_nodes[0].text = replaced
                            for node in replacement_text_nodes[1:]:
                                node.text = ""
                            for run in children[field_begin_idx:idx + 1]:
                                paragraph.remove(run)
                            paragraph.insert(field_begin_idx, replacement_run)
                            children = list(paragraph)
                            idx = field_begin_idx
                            field_begin_idx = None
                            field_separate_idx = None
                            continue

                    field_begin_idx = None
                    field_separate_idx = None
            idx += 1

        for text_node in paragraph.findall(W_T_PATH, ns):
            original = text_node.text or ""
            replaced = _replace_placeholders_in_text(original, lookup, legacy_aliases)
            if replaced != original:
                text_node.text = replaced

    return ET.tostring(root, encoding="unicode")

def apply_legacy_placeholder_fallbacks(docx_path: str, context: dict) -> None:
    """
    Replace legacy non-docxtpl placeholders directly in DOCX XML.
    This keeps old template markers like <<Prefix>><<Name>> usable.
    """
    legacy_aliases = {
        "Annual__Conveyance": "Annual_Conveyance",
        "Monthly_LTC": "Monthly_LTA",
        "Annual_LTC": "Annual_LTA",
        "Monthly_Sodexo": "Monthly_Food",
        "Annual_Sodexo": "Annual_Food",
    }

    lookup = {}
    for key, value in context.items():
        scalar = _to_scalar_string(value)
        if scalar != "":
            lookup[key] = scalar
            lookup[_norm_key(key)] = scalar

    candidate_full_name = lookup.get("Candidate_Full_Name", "")
    aliases = {
        "Prefix": "",
        "Name": candidate_full_name,
        "First_Name": candidate_full_name,
        "Candidate Name": candidate_full_name,
        "Candidate_Name": candidate_full_name,
    }
    for key, value in aliases.items():
        lookup[key] = value
        lookup[_norm_key(key)] = value

    temp_docx = f"{docx_path}.tmp"
    with zipfile.ZipFile(docx_path, "r") as zin, zipfile.ZipFile(temp_docx, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename.startswith("word/") and item.filename.endswith(".xml"):
                xml_text = data.decode("utf-8")
                xml_text = _replace_placeholder_runs_in_xml(xml_text, lookup, legacy_aliases)
                data = xml_text.encode("utf-8")
            zout.writestr(item, data)
    os.replace(temp_docx, docx_path)


def calculate_salary_breakdown(total_salary: float):
    # ===== FIXED =====
    monthly_ctc = total_salary / 12
    total_annual_ctc = total_salary

    # ===== BASIC =====
    basic_monthly = monthly_ctc * 0.5
    basic_annual = basic_monthly * 12

    # ===== FIXED COMPONENTS =====
    food = 8800
    employer_pf = 1800

    # ===== GRATUITY (CORRECT) =====
    gratuity_annual = (basic_annual / 26) * 15 / 12
    gratuity_monthly = gratuity_annual / 12  # ≈ 2404

    # ===== REMAINING (IMPORTANT FIX) =====
    remaining = monthly_ctc - (basic_monthly + food + employer_pf + gratuity_monthly)

    # ===== SPLIT =====
    hra = remaining * 0.7
    conveyance = remaining * 0.1
    lta = remaining * 0.2

    # ===== TOTAL EARNINGS =====
    total_earnings_monthly = basic_monthly + hra + conveyance + lta + food
    total_earnings_annual = total_earnings_monthly * 12

    # ===== STATUTORY =====
    total_statutory_monthly = employer_pf + gratuity_monthly
    total_statutory_annual = total_statutory_monthly * 12

    # ===== DEDUCTIONS =====
    pf_total = 3600  # 1800 + 1800
    professional_tax = 200

    total_deductions_monthly = pf_total + professional_tax  # NOTE: gratuity NOT here
    total_deductions_annual = total_deductions_monthly * 12

    # ===== NET =====
    net_monthly = monthly_ctc - total_deductions_monthly
    net_annual = total_annual_ctc - total_deductions_annual

    return {
        "Monthly_Basic": round(basic_monthly),
        "Annual_Basic": round(basic_annual),

        "Monthly_HRA": round(hra),
        "Annual_HRA": round(hra * 12),

        "Monthly_Conveyance": round(conveyance),
        "Annual_Conveyance": round(conveyance * 12),

        "Monthly_LTA": round(lta),
        "Annual_LTA": round(lta * 12),

        "Monthly_Food": food,
        "Annual_Food": food * 12,

        "Monthly_Gratuity": round(gratuity_monthly),
        "Annual_Gratuity": round(gratuity_monthly * 12),

        "Employer_PF_Monthly": employer_pf,
        "Employer_PF_Annual": employer_pf * 12,

        "Total_Earnings_Monthly": round(total_earnings_monthly),
        "Total_Earnings_Annual": round(total_earnings_annual),

        "Total_Statutory_Monthly": round(total_statutory_monthly),
        "Total_Statutory_Annual": round(total_statutory_annual),

        "Total_Monthly_CTC": round(monthly_ctc),
        "Total_Annual_CTC": round(total_annual_ctc),
        "Monthly_PF": "3600(1800 + 1800)",
        "Annual_PF": 3600 * 12,
        "Monthly_Professional_Tax": 200,
        "Annual_Professional_Tax": 200 * 12,

        "Total_Deductions_Monthly": total_deductions_monthly,
        "Total_Deductions_Annual": total_deductions_annual,

        "Net_Monthly_Salary": round(net_monthly),
        "Net_Annual_Salary": round(net_annual),
    }

def _run_soffice_convert(input_path: str, outdir: str, profile_uri: str, convert_to: str):
    proc = subprocess.run(  # nosec B603 B607
        [
            "soffice",
            "--headless",
            "--nologo",
            "--nodefault",
            "--norestore",
            "--nolockcheck",
            f"-env:UserInstallation={profile_uri}",
            "--convert-to",
            convert_to,
            "--outdir",
            outdir,
            input_path,
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    if proc.stdout:
        print(proc.stdout.strip())
    if proc.stderr:
        print(proc.stderr.strip())

def _pdf_contains_required_markers(path: str) -> bool:
    required_markers = [
        "Deductions will be made towards Provident Fund",
        "Candidate",
        "Signature",
        "valid for you to join",
    ]
    try:
        reader = PdfReader(path)
        text = "\n".join((page.extract_text() or "") for page in reader.pages).lower()
        return all(marker.lower() in text for marker in required_markers)
    except Exception as exc:
        print(f"PDF text-check warning: {exc}")
        return False

def convert_docx_to_pdf_libreoffice(docx_path, pdf_path):
    output_dir = os.path.dirname(pdf_path)
    os.makedirs(output_dir, exist_ok=True)
    profile_dir = tempfile.mkdtemp(prefix="libreoffice-profile-")
    profile_uri = Path(profile_dir).resolve().as_uri()
    docx_abs = str(Path(docx_path).resolve())
    pdf_filter = 'pdf:writer_pdf_Export:{"ExportFormFields":{"type":"boolean","value":"false"}}'

    try:
        _run_soffice_convert(docx_abs, output_dir, profile_uri, pdf_filter)
    except subprocess.CalledProcessError as e:
        raise Exception(
            f"LibreOffice conversion failed (code={e.returncode}): "
            f"stdout={e.stdout} stderr={e.stderr}"
        ) from e
    finally:
        shutil.rmtree(profile_dir, ignore_errors=True)

    converted_pdf = os.path.join(output_dir, f"{Path(docx_abs).stem}.pdf")
    if converted_pdf != pdf_path and os.path.exists(converted_pdf):
        os.replace(converted_pdf, pdf_path)
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"Converted PDF not found at expected path: {pdf_path}")

    # Fallback conversion when known sections disappear
    if not _pdf_contains_required_markers(pdf_path):
        print("Primary DOCX->PDF appears incomplete; retrying with DOCX->ODT->PDF fallback.")
        profile_dir_fallback = tempfile.mkdtemp(prefix="libreoffice-profile-fallback-")
        profile_uri_fallback = Path(profile_dir_fallback).resolve().as_uri()
        try:
            odt_path = os.path.join(output_dir, f"{Path(docx_abs).stem}.odt")
            _run_soffice_convert(docx_abs, output_dir, profile_uri_fallback, "odt")
            if not os.path.exists(odt_path):
                raise FileNotFoundError(f"Fallback ODT not found: {odt_path}")
            _run_soffice_convert(odt_path, output_dir, profile_uri_fallback, pdf_filter)
            fallback_pdf = os.path.join(output_dir, f"{Path(odt_path).stem}.pdf")
            if fallback_pdf != pdf_path and os.path.exists(fallback_pdf):
                os.replace(fallback_pdf, pdf_path)
            if not os.path.exists(pdf_path):
                raise FileNotFoundError(f"Fallback PDF not found at expected path: {pdf_path}")
        finally:
            shutil.rmtree(profile_dir_fallback, ignore_errors=True)

def generate_offer_letter_pdf(
    offer_data: OfferLetterRequest,
    salary_breakdown: dict,
    created_by: str,
    template_path: str = "sample_offer_letters/Offer Letter__format.docx"
) -> dict:
    """Generate PDF offer letter from docx template, upload to Azure Blob Storage, and return blob URLs."""
    # If the template doesn't exist at the given path, check under backend
    if not os.path.exists(template_path):
        alt_path = os.path.join("backend", template_path)
        if os.path.exists(alt_path):
            template_path = alt_path
            
    doc = DocxTemplate(template_path)
    base_context = offer_data.model_dump()
    context = {
        **base_context,
        "Date_Of_Offer_Generation": datetime.now().strftime("%B %d, %Y"),
        "Candidate_Full_Name": offer_data.candidate_name,
        "Designation": offer_data.designation,
        "Grade": offer_data.grade,
        "Location": offer_data.facility or offer_data.work_location,
        "Technology_Solutions_Center": offer_data.tsc,
        "Date_Of_Joining": offer_data.joining_date,
        **salary_breakdown,
        "Total_In_Words": num2words(offer_data.total_salary, lang='en_IN').title() + " Rupees Only",
    }
    doc.render(context)
    
    output_dir = "generated_offer_letters"
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    docx_filename = f"{output_dir}/vm_offer_letter_{offer_data.candidate_name.replace(' ', '_')}_{timestamp}.docx"
    doc.save(docx_filename)
    apply_legacy_placeholder_fallbacks(docx_filename, context)
    
    pdf_filename = f"{output_dir}/vm_offer_letter_{offer_data.candidate_name.replace(' ', '_')}_{timestamp}.pdf"
    try:
        convert_docx_to_pdf_libreoffice(docx_filename, pdf_filename)
    except Exception as e:
        raise Exception(f"PDF conversion failed: {e}")
        
    password_protect_pdf(
        pdf_filename,
        password=offer_data.pan if hasattr(offer_data, "pan") and offer_data.pan else None,
    )
    
    blob_name_pdf = os.path.basename(pdf_filename)
    pdf_url = upload_file_to_blob(pdf_filename, blob_name_pdf)
    
    blob_name_docx = os.path.basename(docx_filename)
    docx_url = upload_file_to_blob(docx_filename, blob_name_docx)
    
    return {"pdf_url": pdf_url, "docx_url": docx_url}

def password_protect_pdf(pdf_path: str, password: str = None):
    """Add password protection to PDF"""
    if password is None:
        password = os.getenv("DEFAULT_OFFER_PASSWORD", "Offer2024")
    try:
        writer = PdfWriter(clone_from=pdf_path)
        writer.encrypt(password)
        with open(pdf_path, "wb") as output_file:
            writer.write(output_file)
    except Exception:
        reader = PdfReader(pdf_path)
        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)
        writer.encrypt(password)
        with open(pdf_path, "wb") as output_file:
            writer.write(output_file)

def generate_offer_letter_docx(
    offer_data: OfferLetterRequest,
    salary_breakdown: SalaryBreakdown,
    created_by: str,
    template_path: str = "sample_offer_letters/Offer Letter__format.docx"
) -> str:
    """Generate offer letter using docx template and save as new docx file"""
    if not os.path.exists(template_path):
        alt_path = os.path.join("backend", template_path)
        if os.path.exists(alt_path):
            template_path = alt_path
            
    doc = DocxTemplate(template_path)
    if salary_breakdown is None:
        salary_breakdown = calculate_salary_breakdown(offer_data.total_salary)
    base_context = offer_data.model_dump()
    context = {
        **base_context,
        "Date_Of_Offer_Generation": datetime.now().strftime("%B %d, %Y"),
        "Candidate_Full_Name": offer_data.candidate_name,
        "Designation": offer_data.designation,
        "Grade": offer_data.grade,
        "Location": offer_data.facility or offer_data.work_location,
        "Technology_Solutions_Center": offer_data.tsc,
        "Date_Of_Joining": offer_data.joining_date,
        **salary_breakdown,
        "Total_In_Words": num2words(offer_data.total_salary, lang='en_IN').title() + " Rupees Only",
    }

    doc.render(context)

    output_dir = "generated_offer_letters"
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{output_dir}/vm_offer_letter_{offer_data.candidate_name.replace(' ', '_')}_{timestamp}.docx"
    doc.save(filename)
    apply_legacy_placeholder_fallbacks(filename, context)
    return filename

def upload_file_to_blob(local_path: str, blob_name: str) -> str:
    """Upload a file to Azure Blob Storage using SAS URL."""
    if "?" in AZURE_STORAGE_SAS_URL:
        base_url, sas_query = AZURE_STORAGE_SAS_URL.split("?", 1)
        blob_url = f"{base_url.rstrip('/')}/{blob_name}?{sas_query}"
    else:
        blob_url = f"{AZURE_STORAGE_SAS_URL.rstrip('/')}/{blob_name}"

    try:
        blob_client = BlobClient.from_blob_url(blob_url)
        with open(local_path, "rb") as data:
            blob_client.upload_blob(data, overwrite=True)
        return blob_client.url
    except Exception as e:
        print(f"Azure Upload Failed: {e}. Falling back to local file link.")
        # Local fallback url matching local testing
        return f"/generated_offer_letters/{blob_name}"

def build_email_payload(
    to_email: str,
    subject: str,
    body: str,
    pdf_path: str,
    cc_email: str = None,
):
    """Build ACS payload."""
    import base64

    parsed = urlparse(pdf_path)
    is_url = parsed.scheme in ("http", "https")

    if is_url:
        try:
            with urlopen(pdf_path) as response:  # nosec B310
                pdf_bytes = response.read()
            attachment_name = os.path.basename(unquote(parsed.path)) or "offer_letter.pdf"
        except Exception:
            # Fallback if URL is a local mockup path
            local_fallback = os.path.join("generated_offer_letters", os.path.basename(unquote(parsed.path)))
            if os.path.exists(local_fallback):
                with open(local_fallback, "rb") as f:
                    pdf_bytes = f.read()
                attachment_name = os.path.basename(local_fallback)
            else:
                raise
    else:
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()
        attachment_name = os.path.basename(pdf_path)

    pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")

    recipients = {"to": [{"address": to_email}]}
    if cc_email:
        recipients["cc"] = [{"address": cc_email}]

    attachments = [
        {
            "name": attachment_name,
            "contentType": "application/pdf",
            "contentInBase64": pdf_base64,
        }
    ]

    import re
    plain_text = re.sub(r"<[^>]+>", "", body)

    return {
        "senderAddress": ACS_SENDER_ADDRESS,
        "recipients": recipients,
        "content": {
            "subject": subject,
            "plainText": plain_text.strip(),
            "html": body,
        },
        "attachments": attachments,
    }

def send_offer_letter_email_acs(
    to_email: str,
    subject: str,
    body: str,
    pdf_path: str,
    cc_email: str = None,
):
    """Send email via ACS. Fallback to mock log if client connection fails."""
    try:
        client = EmailClient.from_connection_string(ACS_CONNECTION_STRING)
        message = build_email_payload(to_email, subject, body, pdf_path, cc_email)
        poller = client.begin_send(message)
        result = poller.result()
        print(f"ACS Email sent: {result}")
        return True
    except Exception as e:
        print(f"ACS Email dispatch failed: {e}. Executed local mock email dispatch instead.")
        # Logging to console for verification
        print(f"MOCK EMAIL SENT to {to_email} with CC {cc_email} subject: {subject}")
        return False

def send_offer_letter_email(
    to_email: str,
    pdf_path: str,
    candidate_name: str,
    subject: str = None,
    body: str = None,
    designation: str = None,
    joining_date: str = None,
    facility: str = None,
    work_mode: str = None,
    tag_poc: str = None,
    cc_email: str = None
):
    if subject is None:
        subject = f"ValueMomentum Offer Letter - Congratulations {candidate_name}!"

    if body is None:
        body = f"""
<div style="font-family: Aptos, Arial, sans-serif; font-size:14px;">

Dear {candidate_name},
<br>

Congratulations!
<br>

Further to our conversation, we are pleased to extend an offer of employment to you on behalf of ValueMomentum Services Private Limited (ValueMomentum) as per the details mentioned below. The India Development Center is going through an exciting and challenging growth phase, and we would be happy to have you be a part of this journey.
<br>

<table border='1' cellpadding='5' cellspacing='0' style="border-collapse:collapse;">
<tr><td><b>Role</b></td><td>{designation}</td></tr>
<tr><td><b>Date of Joining</b></td><td>{joining_date}</td></tr>
<tr><td><b>Facility</b></td><td>{facility}</td></tr>
<tr><td><b>Work Mode</b></td><td>{work_mode}</td></tr>
</table>

<br>

We kindly ask you to thoroughly review the attached documents, namely the Offer Letter (PDF) and Flexi Benefit Document (PDF).
<br>

Please note that this offer (along with the final form of any referenced documents), represents the entire agreement between you and ValueMomentum and that no verbal or written agreements, promises or representations that are not specifically stated in this offer, are or will be binding upon ValueMomentum.

<br>

You may communicate your decision over an email by tomorrow so that we can organize the next set of formalities.

<br>

<b>Joining Co-ordinates:</b><br>

<table border='1' cellpadding='5' cellspacing='0' style="border-collapse:collapse;">
<tr><td><b>Time</b></td><td>10:00 AM</td></tr>
<tr><td><b>Facility</b></td><td>{facility}</td></tr>
<tr><td><b>Onboarding Team Email Address</b></td><td>Onboarding_VM@valuemomentum.com</td></tr>
<tr><td><b>Onboarding Point of Contact</b></td><td>HR Operations Team</td></tr>
<tr><td><b>TAG POC</b></td><td>{tag_poc}</td></tr>
</table>

<br>

Please feel free to call the TAG POC on the contact number mentioned above, in case you have any queries or need further information.

<br>

Thanks and Regards,<br>
Talent Acquisition Team

<br>

<div style="font-size:11px; color:#555;">
Information contained and transmitted by this E-MAIL is proprietary to ValueMomentum Inc. and is intended for use only by the individual or entity to which it is addressed, and may contain information that is privileged, confidential or exempt from disclosure under applicable law. If this is a forwarded message, the content of this E-MAIL may not have been sent with the authority of the Company. If you are not the intended recipient, an agent of the intended recipient or a person responsible for delivering the information to the named recipient, you are notified that any use, distribution, transmission, printing, copying or dissemination of this information in any way or in any manner is strictly prohibited. If you have received this communication in error, please delete this mail & notify us immediately at info@valuemomentum.com
</div>

</div>
"""

    return send_offer_letter_email_acs(to_email, subject, body, pdf_path, cc_email=cc_email)
