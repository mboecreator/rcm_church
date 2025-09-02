/*
Admin Panel JavaScript - Revival Crusade Missions International
*/

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global variables
let currentUser = null;
let authToken = localStorage.getItem('adminToken');

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const headerTime = document.getElementById('headerTime');
const refreshBtn = document.getElementById('refreshBtn');

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    initializeAdminPanel();
    updateTime();
    setInterval(updateTime, 1000);
});

// Initialize admin panel
async function initializeAdminPanel() {
    if (authToken) {
        try {
            await verifyToken();
            showDashboard();
            initializeDashboard();
        } catch (error) {
            console.error('Token verification failed:', error);
            showLogin();
        }
    } else {
        showLogin();
    }
    
    initializeEventListeners();
}

// Initialize event listeners
function initializeEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout button
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Refresh button
    refreshBtn.addEventListener('click', refreshCurrentSection);
    
    // Add buttons
    document.getElementById('addEventBtn')?.addEventListener('click', () => openEventModal());
    document.getElementById('addNoticeBtn')?.addEventListener('click', () => openNoticeModal());
    document.getElementById('addMemberBtn')?.addEventListener('click', () => openMemberModal());
    
    // Settings forms
    document.getElementById('profileForm')?.addEventListener('submit', handleProfileUpdate);
    document.getElementById('passwordForm')?.addEventListener('submit', handlePasswordChange);
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
        showLoginLoading(true);
        hideLoginError();
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('adminToken', authToken);
            
            showDashboard();
            initializeDashboard();
        } else {
            showLoginError(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('Network error. Please try again.');
    } finally {
        showLoginLoading(false);
    }
}

// Handle logout
function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('adminToken');
    showLogin();
}

// Verify token
async function verifyToken() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    });
    
    const data = await response.json();
    
    if (data.success) {
        currentUser = data.user;
        return data.user;
    } else {
        throw new Error('Token verification failed');
    }
}

// Show login screen
function showLogin() {
    loginScreen.style.display = 'flex';
    adminDashboard.style.display = 'none';
    document.body.style.overflow = 'hidden';
}

// Show dashboard
function showDashboard() {
    loginScreen.style.display = 'none';
    adminDashboard.style.display = 'flex';
    document.body.style.overflow = 'auto';
    
    // Update user info
    if (currentUser) {
        const userNameEl = userInfo.querySelector('.user-name');
        const userRoleEl = userInfo.querySelector('.user-role');
        
        if (userNameEl) userNameEl.textContent = currentUser.name;
        if (userRoleEl) userRoleEl.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    }
}

// Show login loading state
function showLoginLoading(loading) {
    const btnText = document.querySelector('.btn-text');
    const btnSpinner = document.querySelector('.btn-spinner');
    
    if (loading) {
        btnText.style.display = 'none';
        btnSpinner.style.display = 'block';
        loginBtn.disabled = true;
    } else {
        btnText.style.display = 'block';
        btnSpinner.style.display = 'none';
        loginBtn.disabled = false;
    }
}

// Show login error
function showLoginError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
}

// Hide login error
function hideLoginError() {
    loginError.style.display = 'none';
}

// Handle navigation
function handleNavigation(e) {
    e.preventDefault();
    
    const section = e.target.dataset.section;
    if (!section) return;
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Show section
    showSection(section);
    
    // Load section data
    loadSectionData(section);
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update page title
    updatePageTitle(sectionName);
}

// Update page title
function updatePageTitle(section) {
    const titles = {
        dashboard: { title: 'Dashboard', subtitle: 'Welcome to the RCMI Admin Panel' },
        events: { title: 'Events Management', subtitle: 'Create and manage church events' },
        notices: { title: 'Notices Management', subtitle: 'Create and manage church notices' },
        members: { title: 'Members Management', subtitle: 'Manage church members and their information' },
        settings: { title: 'Settings', subtitle: 'Manage system settings and preferences' }
    };
    
    const titleData = titles[section] || titles.dashboard;
    pageTitle.textContent = titleData.title;
    pageSubtitle.textContent = titleData.subtitle;
}

// Load section data
function loadSectionData(section) {
    switch (section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'events':
            loadEventsData();
            break;
        case 'notices':
            loadNoticesData();
            break;
        case 'members':
            loadMembersData();
            break;
        case 'settings':
            loadSettingsData();
            break;
    }
}

// Initialize dashboard
function initializeDashboard() {
    loadDashboardData();
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load stats
        await Promise.all([
            loadDashboardStats(),
            loadRecentEvents(),
            loadRecentNotices()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load dashboard stats
async function loadDashboardStats() {
    try {
        const [eventsResponse, noticesResponse, membersResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/events?limit=1`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }),
            fetch(`${API_BASE_URL}/notices?limit=1`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }),
            fetch(`${API_BASE_URL}/users/stats`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            })
        ]);
        
        const eventsData = await eventsResponse.json();
        const noticesData = await noticesResponse.json();
        const membersData = await membersResponse.json();
        
        // Update stats
        document.getElementById('totalEvents').textContent = eventsData.pagination?.totalEvents || 0;
        document.getElementById('totalNotices').textContent = noticesData.pagination?.totalNotices || 0;
        document.getElementById('totalMembers').textContent = membersData.data?.totalUsers || 0;
        
        // Load featured events count
        const featuredResponse = await fetch(`${API_BASE_URL}/events/featured`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const featuredData = await featuredResponse.json();
        document.getElementById('featuredEvents').textContent = featuredData.data?.length || 0;
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Load recent events
async function loadRecentEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/events?limit=5&sort=createdAt`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const eventsHtml = data.data.map(event => `
                <div class="recent-item">
                    <div class="recent-item-content">
                        <h4>${event.title}</h4>
                        <p>${event.category} • ${new Date(event.date).toLocaleDateString()}</p>
                    </div>
                    <span class="status-badge ${event.status}">${event.status}</span>
                </div>
            `).join('');
            
            document.getElementById('recentEvents').innerHTML = eventsHtml;
        } else {
            document.getElementById('recentEvents').innerHTML = '<p>No recent events</p>';
        }
    } catch (error) {
        console.error('Error loading recent events:', error);
        document.getElementById('recentEvents').innerHTML = '<p>Error loading events</p>';
    }
}

// Load recent notices
async function loadRecentNotices() {
    try {
        const response = await fetch(`${API_BASE_URL}/notices?limit=5&sort=createdAt`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const noticesHtml = data.data.map(notice => `
                <div class="recent-item">
                    <div class="recent-item-content">
                        <h4>${notice.title}</h4>
                        <p>${notice.category} • ${new Date(notice.publishDate).toLocaleDateString()}</p>
                    </div>
                    <span class="status-badge ${notice.priority}">${notice.priority}</span>
                </div>
            `).join('');
            
            document.getElementById('recentNotices').innerHTML = noticesHtml;
        } else {
            document.getElementById('recentNotices').innerHTML = '<p>No recent notices</p>';
        }
    } catch (error) {
        console.error('Error loading recent notices:', error);
        document.getElementById('recentNotices').innerHTML = '<p>Error loading notices</p>';
    }
}

// Load events data
async function loadEventsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/events`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayEventsTable(data.data);
        } else {
            console.error('Failed to load events:', data.message);
        }
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// Display events table
function displayEventsTable(events) {
    const tbody = document.getElementById('eventsTableBody');
    
    if (!events || events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No events found</td></tr>';
        return;
    }
    
    const eventsHtml = events.map(event => `
        <tr>
            <td><strong>${event.title}</strong></td>
            <td>${event.category}</td>
            <td>${new Date(event.date).toLocaleDateString()}</td>
            <td>${event.location}</td>
            <td><span class="status-badge ${event.status}">${event.status}</span></td>
            <td>
                <button class="action-btn view" onclick="viewEvent('${event._id}')">View</button>
                <button class="action-btn edit" onclick="editEvent('${event._id}')">Edit</button>
                <button class="action-btn delete" onclick="deleteEvent('${event._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = eventsHtml;
}

// Load notices data
async function loadNoticesData() {
    try {
        const response = await fetch(`${API_BASE_URL}/notices`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayNoticesTable(data.data);
        } else {
            console.error('Failed to load notices:', data.message);
        }
    } catch (error) {
        console.error('Error loading notices:', error);
    }
}

// Display notices table
function displayNoticesTable(notices) {
    const tbody = document.getElementById('noticesTableBody');
    
    if (!notices || notices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No notices found</td></tr>';
        return;
    }
    
    const noticesHtml = notices.map(notice => `
        <tr>
            <td><strong>${notice.title}</strong></td>
            <td>${notice.category}</td>
            <td><span class="status-badge ${notice.priority}">${notice.priority}</span></td>
            <td>${new Date(notice.publishDate).toLocaleDateString()}</td>
            <td><span class="status-badge ${notice.isActive ? 'active' : 'inactive'}">${notice.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>
                <button class="action-btn view" onclick="viewNotice('${notice._id}')">View</button>
                <button class="action-btn edit" onclick="editNotice('${notice._id}')">Edit</button>
                <button class="action-btn delete" onclick="deleteNotice('${notice._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = noticesHtml;
}

// Load members data
async function loadMembersData() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayMembersTable(data.data);
        } else {
            console.error('Failed to load members:', data.message);
        }
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

// Display members table
function displayMembersTable(members) {
    const tbody = document.getElementById('membersTableBody');
    
    if (!members || members.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No members found</td></tr>';
        return;
    }
    
    const membersHtml = members.map(member => `
        <tr>
            <td><strong>${member.name}</strong></td>
            <td>${member.email}</td>
            <td><span class="status-badge ${member.role}">${member.role}</span></td>
            <td>${new Date(member.membershipDate).toLocaleDateString()}</td>
            <td><span class="status-badge ${member.isActive ? 'active' : 'inactive'}">${member.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>
                <button class="action-btn view" onclick="viewMember('${member._id}')">View</button>
                <button class="action-btn edit" onclick="editMember('${member._id}')">Edit</button>
                <button class="action-btn delete" onclick="deleteMember('${member._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = membersHtml;
}

// Load settings data
function loadSettingsData() {
    if (currentUser) {
        document.getElementById('profileName').value = currentUser.name || '';
        document.getElementById('profileEmail').value = currentUser.email || '';
        document.getElementById('profilePhone').value = currentUser.phone || '';
    }
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const profileData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(profileData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            showNotification('Profile updated successfully', 'success');
            
            // Update user info in sidebar
            const userNameEl = userInfo.querySelector('.user-name');
            if (userNameEl) userNameEl.textContent = currentUser.name;
        } else {
            showNotification(data.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Handle password change
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Password changed successfully', 'success');
            e.target.reset();
        } else {
            showNotification(data.message || 'Failed to change password', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Refresh current section
function refreshCurrentSection() {
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
        const sectionName = activeSection.id.replace('-section', '');
        loadSectionData(sectionName);
    }
}

// Update time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
    
    headerTime.textContent = `${dateString} ${timeString}`;
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--error-color)' : 'var(--info-color)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    });
}

// CRUD operation functions will be defined in modals.js

function viewEvent(eventId) {
    showNotification(`Viewing event: ${eventId}`, 'info');
}

function editEvent(eventId) {
    openEventModal(eventId);
}

function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        showNotification(`Deleting event: ${eventId}`, 'info');
    }
}

function viewNotice(noticeId) {
    showNotification(`Viewing notice: ${noticeId}`, 'info');
}

function editNotice(noticeId) {
    openNoticeModal(noticeId);
}

function deleteNotice(noticeId) {
    if (confirm('Are you sure you want to delete this notice?')) {
        showNotification(`Deleting notice: ${noticeId}`, 'info');
    }
}

function viewMember(memberId) {
    showNotification(`Viewing member: ${memberId}`, 'info');
}

function editMember(memberId) {
    openMemberModal(memberId);
}

function deleteMember(memberId) {
    if (confirm('Are you sure you want to delete this member?')) {
        showNotification(`Deleting member: ${memberId}`, 'info');
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .recent-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
        border-bottom: 1px solid rgba(212, 175, 55, 0.1);
    }
    
    .recent-item:last-child {
        border-bottom: none;
    }
    
    .recent-item-content h4 {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.3rem;
    }
    
    .recent-item-content p {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin: 0;
    }
`;
document.head.appendChild(style);

console.log('RCMI Admin Panel loaded successfully! 🎉');