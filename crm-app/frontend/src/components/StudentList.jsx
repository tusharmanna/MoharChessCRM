import { useEffect, useState } from 'react';
import { FiSearch, FiChevronRight, FiUser } from 'react-icons/fi';
import { studentAPI } from '../api';
import StudentDetail from './StudentDetail';
import './StudentList.css';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pagination, setPagination] = useState({ offset: 0, limit: 50, total: 0 });

  useEffect(() => {
    fetchStudents();
    fetchBatches();
  }, [search, batchFilter, statusFilter, pagination.offset]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await studentAPI.getAll({
        search,
        batch: batchFilter,
        status: statusFilter,
        offset: pagination.offset,
        limit: pagination.limit,
      });
      setStudents(data.students);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const { data } = await studentAPI.getBatches();
      setBatches(data);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    }
  };

  if (selectedStudent) {
    return (
      <StudentDetail
        studentId={selectedStudent.id}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  return (
    <div className="student-list-container">
      {/* Filters */}
      <div className="filter-section">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((prev) => ({ ...prev, offset: 0 }));
            }}
          />
        </div>

        <select
          className="filter-select"
          value={batchFilter}
          onChange={(e) => {
            setBatchFilter(e.target.value);
            setPagination((prev) => ({ ...prev, offset: 0 }));
          }}
        >
          <option value="all">All Batches</option>
          {batches.map((batch) => (
            <option key={batch} value={batch}>
              {batch}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination((prev) => ({ ...prev, offset: 0 }));
          }}
        >
          <option value="all">All Status</option>
          <option value="prospect">Prospect</option>
          <option value="enrolled">Enrolled</option>
          <option value="active">Active</option>
          <option value="alumni">Alumni</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="students-table-container">
        {loading ? (
          <div className="loading">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <FiUser size={48} />
            <p>No students found</p>
          </div>
        ) : (
          <>
            <table className="students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Batch</th>
                  <th>Status</th>
                  <th>Chess Experience</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="student-row"
                  >
                    <td className="name-cell">
                      <div className="avatar">
                        {student.first_name.charAt(0).toUpperCase()}
                      </div>
                      <span>
                        {student.first_name} {student.last_name}
                      </span>
                    </td>
                    <td>{student.email || '-'}</td>
                    <td>{student.age || '-'}</td>
                    <td>
                      <span className="badge batch-badge">{student.batch}</span>
                    </td>
                    <td>
                      <span className={`badge status-${student.status}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>{student.chess_experience || '-'}</td>
                    <td className="action-cell">
                      <FiChevronRight />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    offset: Math.max(0, prev.offset - prev.limit),
                  }))
                }
                disabled={pagination.offset === 0}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages} ({pagination.total} total)
              </span>
              <button
                className="pagination-btn"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    offset: prev.offset + prev.limit,
                  }))
                }
                disabled={currentPage >= totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StudentList;
