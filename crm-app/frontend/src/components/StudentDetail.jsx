import { useEffect, useState } from 'react';
import { FiArrowLeft, FiPhone, FiMail, FiEdit2, FiX } from 'react-icons/fi';
import { studentAPI, communicationAPI } from '../api';
import './StudentDetail.css';

function StudentDetail({ studentId, onBack }) {
  const [student, setStudent] = useState(null);
  const [parents, setParents] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchStudentDetail();
  }, [studentId]);

  const fetchStudentDetail = async () => {
    try {
      setLoading(true);
      const { data } = await studentAPI.getById(studentId);
      setStudent(data.student);
      setParents(data.parents);
      setCommunications(data.communications);
      setFormData(data.student);
    } catch (error) {
      console.error('Failed to fetch student detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    try {
      await communicationAPI.add({
        student_id: studentId,
        communication_type: 'note',
        message: noteText,
      });
      setNoteText('');
      fetchStudentDetail();
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleUpdateStudent = async () => {
    try {
      await studentAPI.update(studentId, formData);
      setStudent(formData);
      setEditMode(false);
      fetchStudentDetail();
    } catch (error) {
      console.error('Failed to update student:', error);
    }
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="spinner"></div>
        Loading student details...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="detail-error">
        <p>Failed to load student details</p>
        <button onClick={onBack} className="btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="student-detail">
      <button onClick={onBack} className="back-btn">
        <FiArrowLeft /> Back
      </button>

      <div className="detail-grid">
        {/* Left Column - Student Info */}
        <div className="detail-card student-info">
          <div className="card-header">
            <div className="student-avatar-large">
              {student.first_name.charAt(0).toUpperCase()}
            </div>
            <div className="student-title">
              <h1>{student.first_name} {student.last_name}</h1>
              <span className={`status-badge status-${student.status}`}>
                {student.status}
              </span>
            </div>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="btn-edit"
                title="Edit student"
              >
                <FiEdit2 />
              </button>
            )}
          </div>

          {editMode ? (
            <div className="edit-form">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input
                  type="text"
                  value={formData.age || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="prospect">Prospect</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="active">Active</option>
                  <option value="alumni">Alumni</option>
                </select>
              </div>
              <div className="form-group">
                <label>Batch</label>
                <input
                  type="text"
                  value={formData.batch || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, batch: e.target.value })
                  }
                />
              </div>
              <div className="form-actions">
                <button onClick={handleUpdateStudent} className="btn-primary">
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setFormData(student);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="info-section">
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">
                  {student.email ? (
                    <a href={`mailto:${student.email}`}>
                      <FiMail /> {student.email}
                    </a>
                  ) : (
                    '-'
                  )}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Age:</span>
                <span className="value">{student.age || '-'}</span>
              </div>
              <div className="info-item">
                <span className="label">Batch:</span>
                <span className="value">{student.batch}</span>
              </div>
              <div className="info-item">
                <span className="label">Chess Experience:</span>
                <span className="value">{student.chess_experience || '-'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Parents & Communications */}
        <div className="detail-card parents-section">
          <h3>Parent Information</h3>
          {parents.length === 0 ? (
            <p className="empty-message">No parent information available</p>
          ) : (
            <div className="parents-list">
              {parents.map((parent) => (
                <div key={parent.id} className="parent-item">
                  <div className="parent-name">{parent.parent_name}</div>
                  {parent.phone_number && (
                    <a href={`tel:${parent.phone_number}`} className="contact-link">
                      <FiPhone /> {parent.phone_number}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notes Section */}
      <div className="detail-card notes-section">
        <h3>Notes & Communications</h3>

        <div className="add-note">
          <textarea
            placeholder="Add a note or log communication..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows="3"
          />
          <button
            onClick={handleAddNote}
            className="btn-primary"
            disabled={!noteText.trim()}
          >
            Add Note
          </button>
        </div>

        <div className="communications-list">
          {communications.length === 0 ? (
            <p className="empty-message">No communications logged yet</p>
          ) : (
            communications.map((comm) => (
              <div key={comm.id} className="communication-item">
                <div className="comm-header">
                  <span className="comm-type">{comm.communication_type}</span>
                  <span className="comm-date">
                    {new Date(comm.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="comm-message">{comm.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDetail;
