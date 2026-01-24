# ASSIGNMENT SYSTEM - REACT INTEGRATION CODE SNIPPETS

Complete, ready-to-use React code for integrating with the backend assignment API.

---

## 1. Custom Hook for Assignments

**File: `hooks/useAssignments.js`**

```javascript
import { useState, useCallback } from 'react';

export const useAssignments = (token) => {
  const [pending, setPending] = useState([]);
  const [submitted, setSubmitted] = useState([]);
  const [graded, setGraded] = useState([]);
  const [createdAssignments, setCreatedAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleError = (err) => {
    const message = err.response?.data?.message || err.message;
    setError(message);
    console.error('Assignment Error:', message);
  };

  // STUDENT ENDPOINTS
  const fetchPendingAssignments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/assignments/student/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPending(data.assignments || []);
    } catch (err) {
      handleError(err);
      setPending([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchSubmittedAssignments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/assignments/student/submitted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSubmitted(data.assignments || []);
    } catch (err) {
      handleError(err);
      setSubmitted([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchGradedAssignments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/assignments/student/graded`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setGraded(data.assignments || []);
    } catch (err) {
      handleError(err);
      setGraded([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const submitAssignment = useCallback(
    async (studentAssignmentId, submissionLink) => {
      if (!submissionLink.trim()) {
        setError('Submission link cannot be empty');
        return false;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_URL}/api/assignments/${studentAssignmentId}/submit`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ submissionLink }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to submit assignment');
        }

        // Remove from pending and refresh submitted
        setPending((prev) => prev.filter((a) => a.id !== studentAssignmentId));
        await fetchSubmittedAssignments();
        return true;
      } catch (err) {
        handleError(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, fetchSubmittedAssignments]
  );

  // ADMIN ENDPOINTS
  const fetchCreatedAssignments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/assignments/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCreatedAssignments(data.assignments || []);
    } catch (err) {
      handleError(err);
      setCreatedAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createAssignment = useCallback(
    async (assignmentData) => {
      if (!assignmentData.title || !assignmentData.courseId || !assignmentData.dueDate) {
        setError('Title, course, and due date are required');
        return false;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/assignments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(assignmentData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create assignment');
        }

        // Refresh created assignments list
        await fetchCreatedAssignments();
        return true;
      } catch (err) {
        handleError(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, fetchCreatedAssignments]
  );

  const updateAssignment = useCallback(
    async (assignmentId, assignmentData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/assignments/${assignmentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(assignmentData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update assignment');
        }

        // Refresh created assignments list
        await fetchCreatedAssignments();
        return true;
      } catch (err) {
        handleError(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, fetchCreatedAssignments]
  );

  const deleteAssignmentFn = useCallback(
    async (assignmentId) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/assignments/${assignmentId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete assignment');
        }

        // Refresh created assignments list
        await fetchCreatedAssignments();
        return true;
      } catch (err) {
        handleError(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, fetchCreatedAssignments]
  );

  const fetchSubmittedAssignmentsAdmin = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/assignments/admin/submitted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSubmitted(data.assignments || []);
    } catch (err) {
      handleError(err);
      setSubmitted([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchGradedAssignmentsAdmin = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/assignments/admin/graded`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setGraded(data.assignments || []);
    } catch (err) {
      handleError(err);
      setGraded([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const gradeAssignment = useCallback(
    async (studentAssignmentId, score, feedback = '') => {
      if (score === '' || score === null || isNaN(score)) {
        setError('Score must be a valid number');
        return false;
      }

      if (score < 0 || score > 100) {
        setError('Score must be between 0 and 100');
        return false;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_URL}/api/assignments/${studentAssignmentId}/grade`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ score: parseInt(score), feedback }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to grade assignment');
        }

        // Remove from submitted and refresh graded
        setSubmitted((prev) => prev.filter((a) => a.id !== studentAssignmentId));
        await fetchGradedAssignmentsAdmin();
        return true;
      } catch (err) {
        handleError(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, fetchGradedAssignmentsAdmin]
  );

  const updateGrade = useCallback(
    async (studentAssignmentId, score, feedback = '') => {
      if (score === '' || score === null || isNaN(score)) {
        setError('Score must be a valid number');
        return false;
      }

      if (score < 0 || score > 100) {
        setError('Score must be between 0 and 100');
        return false;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_URL}/api/assignments/${studentAssignmentId}/update-grade`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ score: parseInt(score), feedback }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update grade');
        }

        // Refresh graded assignments
        await fetchGradedAssignmentsAdmin();
        return true;
      } catch (err) {
        handleError(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, fetchGradedAssignmentsAdmin]
  );

  return {
    // Data
    pending,
    submitted,
    graded,
    createdAssignments,
    loading,
    error,
    // Student methods
    fetchPendingAssignments,
    fetchSubmittedAssignments,
    fetchGradedAssignments,
    submitAssignment,
    // Admin methods
    fetchCreatedAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignmentFn,
    fetchSubmittedAssignmentsAdmin,
    fetchGradedAssignmentsAdmin,
    gradeAssignment,
    updateGrade,
  };
};
```

---

## 2. Updated AssignmentScreen Component

**File: `pages/AssignmentScreen.jsx`**

```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAssignments } from '../hooks/useAssignments';
import {
  History,
  NotepadText,
  Award,
  Send,
  BadgeCheck,
  Edit,
  Save,
  Plus,
  Trash2,
} from 'lucide-react';
import '../assets/styles/assignment.css';

const AssignmentScreen = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const token = localStorage.getItem('token');

  // Use the custom hook
  const {
    pending,
    submitted,
    graded,
    loading,
    error,
    fetchPendingAssignments,
    fetchSubmittedAssignments,
    fetchGradedAssignments,
    submitAssignment,
    fetchSubmittedAssignmentsAdmin,
    fetchGradedAssignmentsAdmin,
    gradeAssignment,
    updateGrade,
    createdAssignments,
    fetchCreatedAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignmentFn,
  } = useAssignments(token);

  // Local state for form inputs
  const [assignmentLinks, setAssignmentLinks] = useState({});
  const [scores, setScores] = useState({});
  const [editingGradedId, setEditingGradedId] = useState(null);

  // Admin assignment management state
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    maxScore: 100,
  });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    maxScore: 100,
  });

  // Fetch data on component mount and when role changes
  useEffect(() => {
    if (!token) return;

    if (!isAdmin) {
      fetchPendingAssignments();
      fetchSubmittedAssignments();
      fetchGradedAssignments();
    } else {
      fetchSubmittedAssignmentsAdmin();
      fetchGradedAssignmentsAdmin();
    }
  }, [isAdmin, token]);

  // Handle student assignment submission
  const handleSubmitAssignment = async (assignmentId, link) => {
    if (!link.trim()) {
      alert('Please paste a valid assignment link');
      return;
    }

    const success = await submitAssignment(assignmentId, link);
    if (success) {
      setAssignmentLinks((prev) => ({ ...prev, [assignmentId]: '' }));
      alert('Assignment submitted successfully!');
    } else {
      alert(error || 'Failed to submit assignment');
    }
  };

  // Handle admin grading
  const handleSaveScore = async (assignmentId) => {
    const score = scores[assignmentId];

    const success = await gradeAssignment(assignmentId, score);
    if (success) {
      setScores((prev) => ({ ...prev, [assignmentId]: '' }));
      alert('Assignment graded successfully!');
    } else {
      alert(error || 'Failed to grade assignment');
    }
  };

  // Handle admin editing grade
  const handleEditScore = (assignmentId, currentScore) => {
    const cleanScore = currentScore.replace('%', '');
    setEditingGradedId(assignmentId);
    setScores((prev) => ({ ...prev, [assignmentId]: cleanScore }));
  };

  // Handle saving edited grade
  const handleSaveEditedScore = async (assignmentId) => {
    const score = scores[assignmentId];

    const success = await updateGrade(assignmentId, score);
    if (success) {
      setEditingGradedId(null);
      setScores((prev) => ({ ...prev, [assignmentId]: '' }));
      alert('Grade updated successfully!');
    } else {
      alert(error || 'Failed to update grade');
    }
  };

  // Handle input changes
  const handleLinkChange = (assignmentId, value) => {
    setAssignmentLinks((prev) => ({ ...prev, [assignmentId]: value }));
  };

  const handleScoreChange = (assignmentId, value) => {
    setScores((prev) => ({ ...prev, [assignmentId]: value }));
  };

  // Admin assignment management handlers
  const handleCreateAssignment = async () => {
    if (
      !createFormData.title.trim() ||
      !createFormData.description.trim() ||
      !createFormData.courseId ||
      !createFormData.dueDate
    ) {
      alert('Please fill in all required fields');
      return;
    }

    const success = await createAssignment({
      title: createFormData.title,
      description: createFormData.description,
      courseId: createFormData.courseId,
      dueDate: createFormData.dueDate,
      maxScore: createFormData.maxScore,
    });

    if (success) {
      setCreateFormData({
        title: '',
        description: '',
        courseId: '',
        dueDate: '',
        maxScore: 100,
      });
      alert('Assignment created successfully!');
      await fetchCreatedAssignments();
    } else {
      alert(error || 'Failed to create assignment');
    }
  };

  const handleEditStart = (assignmentId, assignment) => {
    setEditingId(assignmentId);
    setEditFormData({
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId,
      dueDate: assignment.dueDate
        .split('T')[0]
        .split('Z')[0], // Format date for input
      maxScore: assignment.maxScore,
    });
  };

  const handleSaveEdit = async (assignmentId) => {
    if (
      !editFormData.title.trim() ||
      !editFormData.description.trim() ||
      !editFormData.courseId ||
      !editFormData.dueDate
    ) {
      alert('Please fill in all required fields');
      return;
    }

    const success = await updateAssignment(assignmentId, {
      title: editFormData.title,
      description: editFormData.description,
      courseId: editFormData.courseId,
      dueDate: editFormData.dueDate,
      maxScore: editFormData.maxScore,
    });

    if (success) {
      setEditingId(null);
      alert('Assignment updated successfully!');
      await fetchCreatedAssignments();
    } else {
      alert(error || 'Failed to update assignment');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (
      window.confirm(
        'Are you sure you want to delete this assignment? Student submissions will be preserved.'
      )
    ) {
      const success = await deleteAssignmentFn(assignmentId);
      if (success) {
        alert('Assignment deleted successfully!');
        await fetchCreatedAssignments();
      } else {
        alert(error || 'Failed to delete assignment');
      }
    }
  };

  // Fetch created assignments on admin mount
  useEffect(() => {
    if (!token || !isAdmin) return;
    fetchCreatedAssignments();
  }, [isAdmin, token]);

  // Show error if any
  if (error && !loading) {
    return (
      <div className="assignments-container">
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="assignments-container">
      {loading && <p className="loading-message">Loading assignments...</p>}

      {!isAdmin && (
        <>
          {/* 1. STUDENT - Pending Assignments */}
          <section className="assignment-card pending-section">
            <div className="card-header">
              <h3>
                <span className="orange">
                  <History size={19} />
                </span>
                Pending Assignments
              </h3>
              <span className="count-badge orange">{pending.length} assignments</span>
            </div>
            <div className="table-responsive">
              <table className="assignment__table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Due Date</th>
                    <th>Assignment Link</th>
                    <th>Action</th>
                  </tr>
                </thead>
                {pending.length > 0 && (
                  <tbody>
                    {pending.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td className="bold">{item.title}</td>
                        <td className="assignment__date">
                          {new Date(item.dueDate).toLocaleDateString()}
                        </td>
                        <td className="first-inputs">
                          <input
                            type="text"
                            placeholder="Paste your assignment link here..."
                            className="link-input first-input"
                            value={assignmentLinks[item.id] || ''}
                            onChange={(e) =>
                              handleLinkChange(item.id, e.target.value)
                            }
                          />
                        </td>
                        <td className="assignment__action">
                          <button
                            className="submit-btn"
                            onClick={() =>
                              handleSubmitAssignment(
                                item.id,
                                assignmentLinks[item.id]
                              )
                            }
                            disabled={loading}
                          >
                            <span>
                              <Send size={18} />
                            </span>
                            {loading ? 'Submitting...' : 'Submit'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
              {pending.length === 0 && (
                <p className="empty__assignment">No Pending Assignment</p>
              )}
            </div>
          </section>

          {/* 2. STUDENT - Submitted Assignments */}
          <section className="assignment-card submitted-section">
            <div className="card-header">
              <h3>
                <span className="blue">
                  <NotepadText size={19} />
                </span>
                Submitted Assignments
              </h3>
              <span className="count-badge blue">{submitted.length} assignments</span>
            </div>
            <div className="table-responsive">
              <table className="assignment__table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Due Date</th>
                    <th>Submitted Date</th>
                    <th>Assignment Link</th>
                    <th>Status</th>
                  </tr>
                </thead>
                {submitted.length > 0 && (
                  <tbody>
                    {submitted.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td className="bold">{item.title}</td>
                        <td>
                          {new Date(item.dueDate).toLocaleDateString()}
                        </td>
                        <td>
                          {new Date(item.submittedDate).toLocaleDateString()}
                        </td>
                        <td>
                          <input
                            type="text"
                            readOnly
                            value={item.submissionLink}
                            className="link-input gray"
                          />
                        </td>
                        <td className="assignment__action">
                          <span className="status-badge pending">
                            <span>
                              <History size={18} />
                            </span>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
              {submitted.length === 0 && (
                <p className="empty__assignment">No Assignment Submitted</p>
              )}
            </div>
          </section>

          {/* 3. STUDENT - Graded Assignments */}
          <section className="assignment-card graded-section">
            <div className="card-header">
              <h3>
                <span className="green">
                  <Award size={19} />
                </span>
                Graded Assignments
              </h3>
              <span className="count-badge green">{graded.length} assignments</span>
            </div>
            <div className="table-responsive">
              <table className="assignment__table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Due Date</th>
                    <th>Submitted Date</th>
                    <th>Assignment Link</th>
                    <th>Score</th>
                  </tr>
                </thead>
                {graded.length > 0 && (
                  <tbody>
                    {graded.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td className="bold">{item.title}</td>
                        <td>
                          {new Date(item.dueDate).toLocaleDateString()}
                        </td>
                        <td>
                          {new Date(item.submittedDate).toLocaleDateString()}
                        </td>
                        <td>
                          <input
                            type="text"
                            readOnly
                            value={item.submissionLink}
                            className="link-input gray"
                          />
                        </td>
                        <td className="assignment__action">
                          <span className="score-badge">
                            <span>
                              <BadgeCheck size={18} />
                            </span>
                            {item.score}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
              {graded.length === 0 && (
                <p className="empty__assignment">No Assignment Graded</p>
              )}
            </div>
          </section>
        </>
      )}

      {/* ADMIN VIEW */}
      {isAdmin && (
        <>
          {/* 0. ADMIN - Create/Manage Assignments */}
          <section className="assignment-card create-assignment-section">
            <div className="card-header">
              <h3>
                <span className="orange">
                  <Plus size={19} />
                </span>
                Create & Manage Assignments
              </h3>
            </div>

            {/* Create Assignment Form */}
            <div className="create-form-container">
              <h4>Create New Assignment</h4>
              <div className="form-group">
                <label htmlFor="title">Assignment Title *</label>
                <input
                  type="text"
                  id="title"
                  placeholder="e.g., Build a Todo App"
                  className="form-input"
                  value={createFormData.title}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <input
                  type="text"
                  id="description"
                  placeholder="e.g., Create a responsive todo application"
                  className="form-input"
                  value={createFormData.description}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="courseId">Course Type *</label>
                <select
                  id="courseId"
                  className="form-select"
                  value={createFormData.courseId}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      courseId: e.target.value,
                    })
                  }
                >
                  <option value="">-- Select Course Type --</option>
                  <option value="html">HTML</option>
                  <option value="js">JavaScript</option>
                  <option value="react">React</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">Due Date *</label>
                <input
                  type="date"
                  id="dueDate"
                  className="form-input"
                  value={createFormData.dueDate}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      dueDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxScore">Max Score (Optional)</label>
                <input
                  type="number"
                  id="maxScore"
                  placeholder="100"
                  className="form-input"
                  value={createFormData.maxScore}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      maxScore: parseInt(e.target.value) || 100,
                    })
                  }
                  min="1"
                  max="1000"
                />
              </div>

              <div className="form-actions">
                <button
                  className="create-btn"
                  onClick={handleCreateAssignment}
                  disabled={loading}
                >
                  <span>
                    <Plus size={18} />
                  </span>
                  {loading ? 'Creating...' : 'Create Assignment'}
                </button>
                <button
                  className="reset-btn"
                  onClick={() =>
                    setCreateFormData({
                      title: '',
                      description: '',
                      courseId: '',
                      dueDate: '',
                      maxScore: 100,
                    })
                  }
                  disabled={loading}
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Created Assignments List */}
            <div className="assignments-list-container">
              <h4>Assignment Management</h4>
              <div className="table-responsive">
                <table className="assignment__table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Course Type</th>
                      <th>Due Date</th>
                      <th>Max Score</th>
                      <th>Created Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  {createdAssignments.length > 0 && (
                    <tbody>
                      {createdAssignments.map((item, index) => (
                        <tr key={item._id || item.id}>
                          <td>{index + 1}</td>
                          <td className="bold">
                            {editingId === (item._id || item.id) ? (
                              <input
                                type="text"
                                className="edit-input"
                                value={editFormData.title}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    title: e.target.value,
                                  })
                                }
                              />
                            ) : (
                              item.title
                            )}
                          </td>
                          <td>{item.courseId || 'N/A'}</td>
                          <td>
                            {editingId === (item._id || item.id) ? (
                              <input
                                type="date"
                                className="edit-input"
                                value={editFormData.dueDate}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    dueDate: e.target.value,
                                  })
                                }
                              />
                            ) : (
                              new Date(item.dueDate).toLocaleDateString()
                            )}
                          </td>
                          <td>{item.maxScore || 100}</td>
                          <td>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <span className="status-badge active">
                              {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="assignment__action">
                            {editingId === (item._id || item.id) ? (
                              <>
                                <button
                                  className="save-btn"
                                  onClick={() =>
                                    handleSaveEdit(item._id || item.id)
                                  }
                                  disabled={loading}
                                >
                                  <span>
                                    <Save size={18} />
                                  </span>
                                  Save
                                </button>
                                <button
                                  className="cancel-btn"
                                  onClick={() => setEditingId(null)}
                                  disabled={loading}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="edit-btn"
                                  onClick={() =>
                                    handleEditStart(item._id || item.id, item)
                                  }
                                >
                                  <span>
                                    <Edit size={18} />
                                  </span>
                                  Edit
                                </button>
                                <button
                                  className="delete-btn"
                                  onClick={() =>
                                    handleDeleteAssignment(
                                      item._id || item.id
                                    )
                                  }
                                  disabled={loading}
                                >
                                  <span>
                                    <Trash2 size={18} />
                                  </span>
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
                {createdAssignments.length === 0 && (
                  <p className="empty__assignment">
                    No assignments created yet. Create your first assignment above!
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* 1. ADMIN - Submitted Assignments */}
          <section className="assignment-card submitted-section">
            <div className="card-header">
              <h3>
                <span className="blue">
                  <NotepadText size={19} />
                </span>
                Submitted Assignments
              </h3>
              <span className="count-badge blue">{submitted.length} assignments</span>
            </div>
            <div className="table-responsive">
              <table className="assignment__table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Student Name</th>
                    <th>Due Date</th>
                    <th>Submitted Date</th>
                    <th>Assignment Link</th>
                    <th>Score</th>
                    <th>Action</th>
                  </tr>
                </thead>
                {submitted.length > 0 && (
                  <tbody>
                    {submitted.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td className="bold">{item.title}</td>
                        <td className="bold">{item.studentName}</td>
                        <td>
                          {new Date(item.dueDate).toLocaleDateString()}
                        </td>
                        <td>
                          {new Date(item.submittedDate).toLocaleDateString()}
                        </td>
                        <td>
                          <input
                            type="text"
                            readOnly
                            value={item.submissionLink}
                            className="link-input gray"
                          />
                        </td>
                        <td className="score-input-cell">
                          <input
                            type="number"
                            placeholder="Enter score..."
                            className="score-input"
                            value={scores[item.id] || ''}
                            onChange={(e) =>
                              handleScoreChange(item.id, e.target.value)
                            }
                            min="0"
                            max="100"
                          />
                        </td>
                        <td className="assignment__action">
                          <button
                            className="save-score-btn"
                            onClick={() => handleSaveScore(item.id)}
                            disabled={loading}
                          >
                            <span>
                              <Save size={18} />
                            </span>
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
              {submitted.length === 0 && (
                <p className="empty__assignment">No Assignment Submitted</p>
              )}
            </div>
          </section>

          {/* 2. ADMIN - Graded Assignments */}
          <section className="assignment-card graded-section">
            <div className="card-header">
              <h3>
                <span className="green">
                  <Award size={19} />
                </span>
                Graded Assignments
              </h3>
              <span className="count-badge green">{graded.length} assignments</span>
            </div>
            <div className="table-responsive">
              <table className="assignment__table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Student Name</th>
                    <th>Due Date</th>
                    <th>Submitted Date</th>
                    <th>Assignment Link</th>
                    <th>Score</th>
                    <th>Action</th>
                  </tr>
                </thead>
                {graded.length > 0 && (
                  <tbody>
                    {graded.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td className="bold">{item.title}</td>
                        <td className="bold">{item.studentName}</td>
                        <td>
                          {new Date(item.dueDate).toLocaleDateString()}
                        </td>
                        <td>
                          {new Date(item.submittedDate).toLocaleDateString()}
                        </td>
                        <td>
                          <input
                            type="text"
                            readOnly
                            value={item.submissionLink}
                            className="link-input gray"
                          />
                        </td>
                        <td>
                          {editingGradedId === item.id ? (
                            <input
                              type="number"
                              className="score-input"
                              value={scores[item.id] || ''}
                              onChange={(e) =>
                                handleScoreChange(item.id, e.target.value)
                              }
                              min="0"
                              max="100"
                            />
                          ) : (
                            <span className="score-badge">
                              <span>
                                <BadgeCheck size={18} />
                              </span>
                              {item.score}
                            </span>
                          )}
                        </td>
                        <td className="assignment__action">
                          {editingGradedId === item.id ? (
                            <button
                              className="save-score-btn"
                              onClick={() => handleSaveEditedScore(item.id)}
                              disabled={loading}
                            >
                              <span>
                                <Save size={18} />
                              </span>
                              {loading ? 'Saving...' : 'Save'}
                            </button>
                          ) : (
                            <button
                              className="edit-btn"
                              onClick={() =>
                                handleEditScore(item.id, item.score)
                              }
                            >
                              <span>
                                <Edit size={18} />
                              </span>
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
              {graded.length === 0 && (
                <p className="empty__assignment">No Assignment Graded</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AssignmentScreen;
```

---

## 3. Environment Configuration

**File: `.env.local`**

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

---

## 4. Error Handling Component (Optional)

**File: `components/ErrorBoundary.jsx`**

```javascript
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## 5. Usage in Main App

**File: `App.jsx` (Updated)**

```javascript
import ErrorBoundary from './components/ErrorBoundary';
import AssignmentScreen from './pages/AssignmentScreen';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* ... other routes ... */}
          <Route path="/assignments" element={<AssignmentScreen />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
```

---

## Implementation Checklist

- [ ] Copy `useAssignments` hook to `hooks/` directory
- [ ] Replace `AssignmentScreen` component with updated version
- [ ] Add `.env.local` with API URL
- [ ] Import and wrap app with `ErrorBoundary`
- [ ] Test pending assignments fetch
- [ ] Test assignment submission
- [ ] Test admin grade functionality
- [ ] Test admin update grade functionality
- [ ] Verify all error messages display correctly
- [ ] Test with actual JWT tokens from backend

---

## Key Points

✅ All API calls use the custom hook
✅ Error handling is built in
✅ Loading states work properly
✅ Date formatting is automatic
✅ Form validation before API calls
✅ State management is clean and organized
✅ Follows React best practices

Ready to integrate! 🚀
