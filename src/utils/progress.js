export const calculateProgress = (formData, documents) => {
  const totalTasks = 10;
  let completed = 0;
  const pendingTasks = [];

  // Check form completion
  const formFields = ['firstName', 'lastName', 'email', 'mobile'];
  const completedFormFields = formFields.filter(f => formData[f]).length;
  completed += completedFormFields;

  if (!formData.firstName || !formData.lastName) {
    pendingTasks.push('Complete personal information');
  }

  // Check documents
  const approvedDocs = documents.filter(d => d.status === 'approved').length;
  completed += approvedDocs;

  const pendingDocs = documents.filter(d => d.status === 'pending').length;
  const rejectedDocs = documents.filter(d => d.status === 'rejected').length;

  if (pendingDocs > 0) {
    pendingTasks.push('Upload pending documents');
  }
  if (rejectedDocs > 0) {
    pendingTasks.push('Re-upload rejected documents');
  }

  const percent = Math.round((completed / totalTasks) * 100);

  return {
    percent,
    completed,
    total: totalTasks,
    pendingTasks
  };
};

