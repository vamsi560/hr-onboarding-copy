import React from 'react';
import Card from '../UI/Card';
import './AlumniAchievements.css';

const AlumniAchievements = () => {
  const achievements = [
    {
      id: 1,
      title: 'Star of the Month',
      category: 'Mark of Excellence',
      date: '2023-03-15',
      description: 'Outstanding performance in Q1 2023 project delivery with 98% client satisfaction',
      icon: '⭐',
      color: '#FFD700',
      details: 'Recognized for exceptional leadership in the e-commerce platform migration project'
    },
    {
      id: 2,
      title: 'Spot Award for Professional Contribution',
      category: 'Recognition',
      date: '2022-11-20',
      description: 'Exceptional contribution to client satisfaction and code quality improvements',
      icon: '🏆',
      color: '#FF6B35',
      details: 'Implemented automated testing framework that reduced bugs by 60%'
    },
    {
      id: 3,
      title: 'Star of the Quarter',
      category: 'Mark of Excellence',
      date: '2022-06-30',
      description: 'Consistent high performance and team leadership in Q2 2022',
      icon: '🌟',
      color: '#4CAF50',
      details: 'Led a team of 5 developers and delivered 3 major features ahead of schedule'
    },
    {
      id: 4,
      title: 'Innovation Award',
      category: 'Technical Excellence',
      date: '2021-12-10',
      description: 'Developed automated testing framework reducing deployment time by 40%',
      icon: '💡',
      color: '#2196F3',
      details: 'Created CI/CD pipeline that became standard across all development teams'
    },
    {
      id: 5,
      title: 'Client Appreciation',
      category: 'Customer Success',
      date: '2021-08-15',
      description: 'Received direct appreciation from client for exceptional service delivery',
      icon: '👏',
      color: '#9C27B0',
      details: 'Maintained 99.9% uptime for critical banking application during peak season'
    },
    {
      id: 6,
      title: 'Team Player Award',
      category: 'Collaboration',
      date: '2020-10-05',
      description: 'Outstanding collaboration and mentoring of junior developers',
      icon: '🤝',
      color: '#FF9800',
      details: 'Mentored 8 junior developers, with 100% retention rate in the team'
    },
    {
      id: 7,
      title: 'Best Code Quality',
      category: 'Technical Excellence',
      date: '2020-03-22',
      description: 'Maintained highest code quality standards with zero critical bugs',
      icon: '💻',
      color: '#607D8B',
      details: 'Achieved 95% code coverage and implemented best practices documentation'
    },
    {
      id: 8,
      title: 'Customer Delight Award',
      category: 'Customer Success',
      date: '2019-07-18',
      description: 'Exceeded customer expectations in project delivery and support',
      icon: '😊',
      color: '#E91E63',
      details: 'Delivered project 2 weeks early with additional features requested by client'
    }
  ];

  const achievementsByYear = achievements.reduce((acc, achievement) => {
    const year = new Date(achievement.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(achievement);
    return acc;
  }, {});

  const totalAchievements = achievements.length;
  const categories = [...new Set(achievements.map(a => a.category))];

  return (
    <div className="alumni-achievements">
      <div className="achievements-header">
        <h1>Your Achievements</h1>
        <p>Recognition and awards earned during your journey with ValueMomentum</p>
      </div>

      <div className="achievements-summary">
        <Card className="summary-card">
          <div className="summary-stats">
            <div className="summary-stat">
              <div className="stat-number">{totalAchievements}</div>
              <div className="stat-label">Total Awards</div>
            </div>
            <div className="summary-stat">
              <div className="stat-number">{categories.length}</div>
              <div className="stat-label">Categories</div>
            </div>
            <div className="summary-stat">
              <div className="stat-number">5.5</div>
              <div className="stat-label">Years</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="achievements-timeline">
        {Object.keys(achievementsByYear)
          .sort((a, b) => b - a)
          .map(year => (
            <div key={year} className="year-section">
              <h2 className="year-title">{year}</h2>
              <div className="achievements-grid">
                {achievementsByYear[year].map(achievement => (
                  <Card key={achievement.id} className="achievement-card">
                    <div className="achievement-header">
                      <div 
                        className="achievement-icon-large" 
                        style={{ backgroundColor: achievement.color }}
                      >
                        {achievement.icon}
                      </div>
                      <div className="achievement-info">
                        <h3 className="achievement-title">{achievement.title}</h3>
                        <div className="achievement-category">{achievement.category}</div>
                        <div className="achievement-date">
                          {new Date(achievement.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="achievement-content">
                      <p className="achievement-description">{achievement.description}</p>
                      <p className="achievement-details">{achievement.details}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
      </div>

      <div className="achievements-footer">
        <Card className="congratulations-card">
          <div className="congratulations-content">
            <div className="congratulations-icon">🎉</div>
            <div>
              <h3>Congratulations!</h3>
              <p>
                You have earned <strong>{totalAchievements} achievements</strong> during your 
                <strong> 5.5 years</strong> with ValueMomentum. Your dedication and excellence 
                have made a lasting impact on our organization.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AlumniAchievements;