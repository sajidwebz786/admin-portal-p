import React, { useState, useEffect } from 'react'

const RuleConfiguration = () => {
  const [activeTab, setActiveTab] = useState('activity')
  const [rules, setRules] = useState({
    activity: {
      minActivities: 20,
      approvalThreshold: 25,
      adminApproval: 'yes',
      activityCompletionThreshold: 75,
      blockReportingIncomplete: 'yes'
    },
    sales: {
      secondarySalesWindow: '1-2',
      chemistCalls: 5,
      projectionDeadline: 1,
      businessDeadline: 1,
      doctorCallsRequired: 'yes'
    },
    reporting: {
      myDayPlanLock: '08:00',
      unlockTime: '00:00',
      minWorkingHours: 8,
      reasonPrompt: 'yes',
      halfDayThreshold: 4,
      allowLateEntry: 'no'
    },
    notifications: {
      primaryObjectiveReminder: 'yes',
      businessEntryReminder: 'yes',
      projectionEntryReminder: 'yes',
      activityIncompleteReminder: 'yes',
      notificationLevel: 'all',
      reminderFrequency: 'daily'
    }
  })

  // Load rules from localStorage on component mount
  useEffect(() => {
    const savedRules = localStorage.getItem('adminRules')
    if (savedRules) {
      try {
        setRules(JSON.parse(savedRules))
      } catch (error) {
        console.error('Error loading saved rules:', error)
      }
    }
  }, [])

  const handleInputChange = (category, field, value) => {
    setRules(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
  }

  const handleSave = (category) => {
    // Save to localStorage
    localStorage.setItem('adminRules', JSON.stringify(rules))
    console.log(`Saving ${category} rules:`, rules[category])
    alert(`${category.charAt(0).toUpperCase() + category.slice(1)} rules saved successfully!`)
  }

  const handleSaveAll = () => {
    localStorage.setItem('adminRules', JSON.stringify(rules))
    console.log('Saving all rules:', rules)
    alert('All rules saved successfully!')
  }

  return (
    <div className="section-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Rule Configuration</h2>
        <button className="btn btn-success" onClick={handleSaveAll}>
          <i className="fas fa-save mr-2"></i>
          Save All Rules
        </button>
      </div>
      
      <div className="config-tabs">
        <button 
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity Rules
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          Sales Rules
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reporting' ? 'active' : ''}`}
          onClick={() => setActiveTab('reporting')}
        >
          Reporting Rules
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notification Rules
        </button>
      </div>

      <div>
        {activeTab === 'activity' && (
          <div className="rule-form">
            <h3>Activity Entry Rules</h3>
            <div className="form-group">
              <label htmlFor="minActivities">Minimum Activities per Month</label>
              <input
                type="number"
                id="minActivities"
                value={rules.activity.minActivities}
                onChange={(e) => handleInputChange('activity', 'minActivities', parseInt(e.target.value))}
              />
              <small className="form-help">Required monthly activity count for field representatives</small>
            </div>
            <div className="form-group">
              <label htmlFor="activityCompletionThreshold">Activity Completion Threshold (%)</label>
              <input
                type="number"
                id="activityCompletionThreshold"
                value={rules.activity.activityCompletionThreshold}
                onChange={(e) => handleInputChange('activity', 'activityCompletionThreshold', parseInt(e.target.value))}
              />
              <small className="form-help">Minimum percentage of activities that must be completed</small>
            </div>
            <div className="form-group">
              <label htmlFor="blockReportingIncomplete">Block Reporting if Incomplete Activities?</label>
              <select
                id="blockReportingIncomplete"
                value={rules.activity.blockReportingIncomplete}
                onChange={(e) => handleInputChange('activity', 'blockReportingIncomplete', e.target.value)}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              <small className="form-help">Prevent submission when activity completion is below threshold</small>
            </div>
            <div className="form-group">
              <label htmlFor="adminApproval">Admin Approval Required?</label>
              <select
                id="adminApproval"
                value={rules.activity.adminApproval}
                onChange={(e) => handleInputChange('activity', 'adminApproval', e.target.value)}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              <small className="form-help">Require admin approval for activity exceptions</small>
            </div>
            <button className="btn btn-primary" onClick={() => handleSave('activity')}>
              Save Activity Rules
            </button>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="rule-form">
            <h3>Sales & Call Rules</h3>
            <div className="form-group">
              <label htmlFor="secondarySalesWindow">Secondary Sales Entry Window (Days of Month)</label>
              <input
                type="text"
                id="secondarySalesWindow"
                value={rules.sales.secondarySalesWindow}
                onChange={(e) => handleInputChange('sales', 'secondarySalesWindow', e.target.value)}
                placeholder="e.g., 1-2 or 1,2,3"
              />
              <small className="form-help">Days when secondary sales entry is allowed</small>
            </div>
            <div className="form-group">
              <label htmlFor="chemistCalls">Minimum Chemist Calls Per Day</label>
              <input
                type="number"
                id="chemistCalls"
                value={rules.sales.chemistCalls}
                onChange={(e) => handleInputChange('sales', 'chemistCalls', parseInt(e.target.value))}
              />
              <small className="form-help">Required daily chemist visit count</small>
            </div>
            <div className="form-group">
              <label htmlFor="doctorCallsRequired">Doctor Call Validation Required?</label>
              <select
                id="doctorCallsRequired"
                value={rules.sales.doctorCallsRequired}
                onChange={(e) => handleInputChange('sales', 'doctorCallsRequired', e.target.value)}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              <small className="form-help">Require DOB, Mobile, and Registration for doctor calls</small>
            </div>
            <div className="form-group">
              <label htmlFor="projectionDeadline">Projection Entry Deadline (Day of Month)</label>
              <input
                type="number"
                id="projectionDeadline"
                value={rules.sales.projectionDeadline}
                onChange={(e) => handleInputChange('sales', 'projectionDeadline', parseInt(e.target.value))}
                min="1"
                max="31"
              />
              <small className="form-help">Last day to enter monthly projections</small>
            </div>
            <div className="form-group">
              <label htmlFor="businessDeadline">Business Entry Deadline (Day of Month)</label>
              <input
                type="number"
                id="businessDeadline"
                value={rules.sales.businessDeadline}
                onChange={(e) => handleInputChange('sales', 'businessDeadline', parseInt(e.target.value))}
                min="1"
                max="31"
              />
              <small className="form-help">Last day to enter business data</small>
            </div>
            <button className="btn btn-primary" onClick={() => handleSave('sales')}>
              Save Sales Rules
            </button>
          </div>
        )}

        {activeTab === 'reporting' && (
          <div className="rule-form">
            <h3>Reporting & Day Call Rules</h3>
            <div className="form-group">
              <label htmlFor="myDayPlanLock">My Day Plan Lock Time (After HH:MM)</label>
              <input
                type="time"
                id="myDayPlanLock"
                value={rules.reporting.myDayPlanLock}
                onChange={(e) => handleInputChange('reporting', 'myDayPlanLock', e.target.value)}
              />
              <small className="form-help">Time after which day plans cannot be modified</small>
            </div>
            <div className="form-group">
              <label htmlFor="unlockTime">My Day Plan Unlock Time (Daily at HH:MM)</label>
              <input
                type="time"
                id="unlockTime"
                value={rules.reporting.unlockTime}
                onChange={(e) => handleInputChange('reporting', 'unlockTime', e.target.value)}
              />
              <small className="form-help">Time when day plans are unlocked for editing</small>
            </div>
            <div className="form-group">
              <label htmlFor="minWorkingHours">Minimum Working Hours (Full Day)</label>
              <input
                type="number"
                id="minWorkingHours"
                value={rules.reporting.minWorkingHours}
                onChange={(e) => handleInputChange('reporting', 'minWorkingHours', parseInt(e.target.value))}
                min="1"
                max="24"
              />
              <small className="form-help">Hours required to mark as full working day</small>
            </div>
            <div className="form-group">
              <label htmlFor="halfDayThreshold">Half Day Threshold (Hours)</label>
              <input
                type="number"
                id="halfDayThreshold"
                value={rules.reporting.halfDayThreshold}
                onChange={(e) => handleInputChange('reporting', 'halfDayThreshold', parseInt(e.target.value))}
                min="1"
                max="12"
              />
              <small className="form-help">Hours below which day is marked as half-day</small>
            </div>
            <div className="form-group">
              <label htmlFor="reasonPrompt">Prompt Reason if Less Than Hours?</label>
              <select
                id="reasonPrompt"
                value={rules.reporting.reasonPrompt}
                onChange={(e) => handleInputChange('reporting', 'reasonPrompt', e.target.value)}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              <small className="form-help">Require explanation for incomplete working days</small>
            </div>
            <div className="form-group">
              <label htmlFor="allowLateEntry">Allow Late Entry?</label>
              <select
                id="allowLateEntry"
                value={rules.reporting.allowLateEntry}
                onChange={(e) => handleInputChange('reporting', 'allowLateEntry', e.target.value)}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              <small className="form-help">Allow data entry after deadlines with approval</small>
            </div>
            <button className="btn btn-primary" onClick={() => handleSave('reporting')}>
              Save Reporting Rules
            </button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="rule-form">
            <h3>Automated Notifications</h3>
            <div className="form-group">
              <label htmlFor="primaryObjectiveReminder">Primary Objective Reminder</label>
              <select
                id="primaryObjectiveReminder"
                value={rules.notifications.primaryObjectiveReminder}
                onChange={(e) => handleInputChange('notifications', 'primaryObjectiveReminder', e.target.value)}
              >
                <option value="yes">Enabled</option>
                <option value="no">Disabled</option>
              </select>
              <small className="form-help">Send reminders for unfulfilled primary objectives</small>
            </div>
            <div className="form-group">
              <label htmlFor="businessEntryReminder">Business Entry Reminder</label>
              <select
                id="businessEntryReminder"
                value={rules.notifications.businessEntryReminder}
                onChange={(e) => handleInputChange('notifications', 'businessEntryReminder', e.target.value)}
              >
                <option value="yes">Enabled</option>
                <option value="no">Disabled</option>
              </select>
              <small className="form-help">Remind users about business entry deadlines</small>
            </div>
            <div className="form-group">
              <label htmlFor="projectionEntryReminder">Projection Entry Reminder</label>
              <select
                id="projectionEntryReminder"
                value={rules.notifications.projectionEntryReminder}
                onChange={(e) => handleInputChange('notifications', 'projectionEntryReminder', e.target.value)}
              >
                <option value="yes">Enabled</option>
                <option value="no">Disabled</option>
              </select>
              <small className="form-help">Remind users about projection entry deadlines</small>
            </div>
            <div className="form-group">
              <label htmlFor="activityIncompleteReminder">Activity Incomplete Reminder</label>
              <select
                id="activityIncompleteReminder"
                value={rules.notifications.activityIncompleteReminder}
                onChange={(e) => handleInputChange('notifications', 'activityIncompleteReminder', e.target.value)}
              >
                <option value="yes">Enabled</option>
                <option value="no">Disabled</option>
              </select>
              <small className="form-help">Notify about incomplete activity submissions</small>
            </div>
            <div className="form-group">
              <label htmlFor="notificationLevel">Email Notification Level</label>
              <select
                id="notificationLevel"
                value={rules.notifications.notificationLevel}
                onChange={(e) => handleInputChange('notifications', 'notificationLevel', e.target.value)}
              >
                <option value="all">All Notifications</option>
                <option value="critical">Critical Only</option>
                <option value="none">None</option>
              </select>
              <small className="form-help">Control which notifications are sent via email</small>
            </div>
            <div className="form-group">
              <label htmlFor="reminderFrequency">Reminder Frequency</label>
              <select
                id="reminderFrequency"
                value={rules.notifications.reminderFrequency}
                onChange={(e) => handleInputChange('notifications', 'reminderFrequency', e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <small className="form-help">How often to send automated reminders</small>
            </div>
            <button className="btn btn-primary" onClick={() => handleSave('notifications')}>
              Save Notification Rules
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RuleConfiguration