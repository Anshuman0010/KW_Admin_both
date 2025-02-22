import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUsers, FiBook, FiSettings, FiLogOut, FiGrid } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AlumniManagement from '../components/AlumniManagement';
import LoadingScreen from '../components/LoadingScreen';
import PageTransition from '../components/PageTransition';
import "../styles/resources.css";

const DashboardContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #2A0845 0%, #1B1464 100%);
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 250px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.h1`
  color: white;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const MenuItem = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  color: white;
  cursor: pointer;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  transition: background 0.3s ease;
  
  ${props => props.active && `
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  `}

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    margin-right: 0.8rem;
  }
`;

const MainContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('https://res.cloudinary.com/dqt4zammn/image/upload/b_rgb:290846/v1739207877/work-concept-illustration_knzqlh.png') no-repeat center center;
    background-size: cover;
    opacity: 0.1;
    z-index: -1;
  }
`;

const UploadedPDFsContainer = styled.div`
  margin-top: 2rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
`;

const PDFHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const FilterSelect = styled.select`
  width: 150px; /* Set a fixed width for consistency */
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  color: black;
  margin-left:1rem;
  font-size: 1rem;
  transition: background 0.3s ease, border 0.3s ease;

  &:focus {
    background: rgba(255, 255, 255, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.5);
    outline: none; /* Remove default outline */
  }
`;

const PDFList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const PDFItem = styled.li`
  background: rgba(255, 255, 255, 0.2);
  margin: 0.5rem 0;
  padding: 0.8rem;
  border-radius: 4px;
  color: white;
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('alumni');
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [uploadedPDFs, setUploadedPDFs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Fetch uploaded PDFs on component mount
  useEffect(() => {
    const fetchPDFs = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (selectedBranch) queryParams.append("branch", selectedBranch);
        if (selectedSemester) queryParams.append("semester", selectedSemester);
        if (selectedCategory) queryParams.append("category", selectedCategory);
  
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pdfs?${queryParams}`);
        const data = await response.json();
        setUploadedPDFs(data);
      } catch (error) {
        console.error("Error fetching PDFs:", error);
      }
    };
  
    fetchPDFs();
  }, [selectedBranch, selectedSemester, selectedCategory]); // Refetch when filters change
  

  const handleUpload = async () => {
    if (!selectedFile || !selectedBranch || !selectedSemester || !selectedCategory) {
      console.error("Missing required fields!");
      return;
    }
    const formData = new FormData();
    formData.append("pdf", selectedFile);
    formData.append("branch", selectedBranch);
    formData.append("semester", selectedSemester);
    formData.append("category", selectedCategory);

    console.log("FormData before sending:");
  for (let pair of formData.entries()) {
    console.log(pair[0] + ": " + pair[1]);
  }
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload/pdf`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        if (response.ok) {
            console.log("Upload successful:", data);
            setUploadedPDFs([...uploadedPDFs, data.file]); // Update UI
        } else {
            console.error("Upload failed:", data.message);
        }
    } catch (error) {
        console.error("Error uploading PDF:", error);
    }
};


  const renderContent = () => { 
    switch (activeSection) {
      case 'alumni':
        return <AlumniManagement />;
      case 'users':
        return <div>Users Management</div>;
      case 'resources':
        return (
          <div className='upload'>
            <div className="upload-section">
              <h2>Upload Resources</h2>
              <select onChange={(e) => setSelectedBranch(e.target.value)}>
                <option value="">Select Branch</option>
                <option value="cs">Computer Science</option>
                <option value="mech">Mechanical Engineering</option>
                <option value="ece">Electronics and Communication</option>
                <option value="eee">Electrical and Electronics</option>
                <option value="civil">Civil Engineering</option>
                <option value="it">Information Technology</option>
                <option value="bio">Biotechnology</option>
              </select>
              <select onChange={(e) => setSelectedSemester(e.target.value)}>
  <option value="">Select Semester</option>
  <option value="1">Semester 1</option>
  <option value="2">Semester 2</option>
  <option value="3">Semester 3</option>
  <option value="4">Semester 4</option>
  <option value="5">Semester 5</option>
  <option value="6">Semester 6</option>
  <option value="7">Semester 7</option>
  <option value="8">Semester 8</option>
</select>

              <select onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">Select Category</option>
                <option value="pyq">Previous Year Questions</option>
                <option value="notes">Notes</option>
              </select>
              <select onChange={(e) => setSelectedSubject(e.target.value)}>
                <option value="">Select Subject</option>
                <option value="math">Mathematics</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="cs">Computer Science</option>
                <option value="mech">Mechanical Engineering</option>
              </select>
              <input type="file" accept="application/pdf" onChange={(e) => setSelectedFile(e.target.files[0])} />
              <button onClick={handleUpload}>Upload PDF</button>
            </div>

            <UploadedPDFsContainer>
  <PDFHeader>
    <h2>Uploaded PDFs</h2>
    <div>
      <FilterSelect onChange={(e) => setSelectedBranch(e.target.value)}>
        <option value="">Filter by Branch</option>
        <option value="cs">Computer Science</option>
        <option value="mech">Mechanical Engineering</option>
        <option value="ece">Electronics and Communication</option>
        <option value="eee">Electrical and Electronics</option>
        <option value="civil">Civil Engineering</option>
        <option value="it">Information Technology</option>
        <option value="bio">Biotechnology</option>
      </FilterSelect>
      <FilterSelect onChange={(e) => setSelectedSemester(e.target.value)}>
        <option value="">Filter by Semester</option>
        <option value="1">Semester 1</option>
        <option value="2">Semester 2</option>
        <option value="3">Semester 3</option>
        <option value="4">Semester 4</option>
        <option value="5">Semester 5</option>
        <option value="6">Semester 6</option>
        <option value="7">Semester 7</option>
        <option value="8">Semester 8</option>
      </FilterSelect>
      <FilterSelect onChange={(e) => setSelectedCategory(e.target.value)}>
        <option value="">Filter by Category</option>
        <option value="pyq">Previous Year Questions</option>
        <option value="notes">Notes</option>
      </FilterSelect>
      <FilterSelect onChange={(e) => setSelectedSubjectFilter(e.target.value)}>
        <option value="">Filter by Subject</option>
        <option value="math">Mathematics</option>
        <option value="physics">Physics</option>
        <option value="chemistry">Chemistry</option>
        <option value="cs">Computer Science</option>
        <option value="mech">Mechanical Engineering</option>
      </FilterSelect>
    </div>
  </PDFHeader>

  <PDFList>
    {uploadedPDFs
      .filter(pdf => !selectedSubjectFilter || pdf.subject === selectedSubjectFilter)
      .map((pdf) => (
        <PDFItem key={pdf._id}>
          <a href={`${import.meta.env.VITE_API_BASE_URL}/${pdf.path}`} target="_blank" rel="noopener noreferrer">
            {pdf.filename}
          </a>
          <span> - {pdf.branch} - {pdf.semester} - {pdf.category} - {pdf.subject}</span>
        </PDFItem>
      ))}
  </PDFList>
</UploadedPDFsContainer>

          </div>
        );
      case 'settings':
        return <div>Settings</div>;
      default:
        return <AlumniManagement />;
    }
  };

  return (
    <PageTransition isLoading={loading}>
      <LoadingScreen message="Loading dashboard" />
      <DashboardContainer>
        <Sidebar>
          <Logo>KIITWALLAH Admin</Logo>
          
          <MenuItem
            active={activeSection === 'alumni'}
            onClick={() => setActiveSection('alumni')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiGrid />
            Alumni Nexus
          </MenuItem>

          <MenuItem
            active={activeSection === 'users'}
            onClick={() => setActiveSection('users')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiUsers />
            Users
          </MenuItem>

          <MenuItem
            active={activeSection === 'resources'}
            onClick={() => setActiveSection('resources')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiBook />
            Resources
          </MenuItem>

          <MenuItem
            active={activeSection === 'settings'}
            onClick={() => setActiveSection('settings')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiSettings />
            Settings
          </MenuItem>

          <MenuItem
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: 'auto' }}
          >
            <FiLogOut />
            Logout
          </MenuItem>
        </Sidebar>

        <MainContent>
          {renderContent()}
        </MainContent>
      </DashboardContainer>
    </PageTransition>
  );
}; 

export default AdminDashboard; 