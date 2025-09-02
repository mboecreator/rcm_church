/*
Admin Panel Modals - Revival Crusade Missions International
*/

// Modal management
class ModalManager {
    constructor() {
        this.currentModal = null;
        this.modalContainer = document.getElementById('modalContainer');
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });
    }

    createModal(title, content, size = 'medium') {
        const modalId = 'modal-' + Date.now();
        const sizeClass = `modal-${size}`;
        
        const modalHTML = `
            <div class="modal-overlay" id="${modalId}">
                <div class="modal-dialog ${sizeClass}">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 class="modal-title">${title}</h3>
                            <button class="modal-close" type="button">&times;</button>
                        </div>
                        <div class="modal-body">
                            ${content}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.modalContainer.innerHTML = modalHTML;
        this.currentModal = document.getElementById(modalId);
        
        // Add event listeners
        this.currentModal.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        this.currentModal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });

        // Show modal
        setTimeout(() => {
            this.currentModal.classList.add('active');
        }, 10);

        return this.currentModal;
    }

    closeModal() {
        if (this.currentModal) {
            this.currentModal.classList.remove('active');
            setTimeout(() => {
                this.modalContainer.innerHTML = '';
                this.currentModal = null;
            }, 300);
        }
    }

    showLoading(message = 'Loading...') {
        const content = `
            <div class="modal-loading">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>${message}</p>
                </div>
            </div>
        `;
        return this.createModal('Please Wait', content, 'small');
    }
}

// Initialize modal manager
const modalManager = new ModalManager();

// Event Modal Functions
function openEventModal(eventId = null) {
    const isEdit = eventId !== null;
    const title = isEdit ? 'Edit Event' : 'Create New Event';
    
    const content = `
        <form id="eventForm" class="modal-form" enctype="multipart/form-data">
            <div class="form-row">
                <div class="form-group">
                    <label for="eventTitle">Event Title *</label>
                    <input type="text" id="eventTitle" name="title" required maxlength="200" 
                           placeholder="Enter event title">
                </div>
                <div class="form-group">
                    <label for="eventCategory">Category *</label>
                    <select id="eventCategory" name="category" required>
                        <option value="">Select Category</option>
                        <option value="Revival Crusade">Revival Crusade</option>
                        <option value="Prayer Meeting">Prayer Meeting</option>
                        <option value="Bible Study">Bible Study</option>
                        <option value="Youth Service">Youth Service</option>
                        <option value="Children Ministry">Children Ministry</option>
                        <option value="Community Outreach">Community Outreach</option>
                        <option value="Leadership Training">Leadership Training</option>
                        <option value="Worship Service">Worship Service</option>
                        <option value="Conference">Conference</option>
                        <option value="Special Event">Special Event</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="eventDescription">Description *</label>
                <textarea id="eventDescription" name="description" required rows="4" maxlength="2000"
                          placeholder="Enter event description"></textarea>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="eventDate">Date *</label>
                    <input type="date" id="eventDate" name="date" required>
                </div>
                <div class="form-group">
                    <label for="eventTime">Time *</label>
                    <input type="time" id="eventTime" name="time" required>
                </div>
            </div>

            <div class="form-group">
                <label for="eventLocation">Location *</label>
                <input type="text" id="eventLocation" name="location" required maxlength="200"
                       placeholder="Enter event location">
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="eventImage">Event Image</label>
                    <input type="file" id="eventImage" name="image" accept="image/*">
                    <small class="form-help">Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF, WebP</small>
                </div>
                <div class="form-group">
                    <label for="eventOrganizer">Organizer</label>
                    <select id="eventOrganizer" name="organizer">
                        <option value="">Loading organizers...</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <div class="checkbox-group">
                        <input type="checkbox" id="registrationRequired" name="registrationRequired">
                        <label for="registrationRequired">Registration Required</label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="maxAttendees">Max Attendees</label>
                    <input type="number" id="maxAttendees" name="maxAttendees" min="1" 
                           placeholder="Leave empty for unlimited">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <div class="checkbox-group">
                        <input type="checkbox" id="isFeatured" name="isFeatured">
                        <label for="isFeatured">Featured Event</label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="eventTags">Tags</label>
                    <input type="text" id="eventTags" name="tags" 
                           placeholder="Enter tags separated by commas">
                </div>
            </div>

            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="modalManager.closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    ${isEdit ? 'Update Event' : 'Create Event'}
                </button>
            </div>
        </form>
    `;

    const modal = modalManager.createModal(title, content, 'large');
    
    // Load organizers
    loadOrganizers();
    
    // If editing, load event data
    if (isEdit) {
        loadEventData(eventId);
    }

    // Handle form submission
    document.getElementById('eventForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleEventSubmit(isEdit, eventId);
    });
}

// Notice Modal Functions
function openNoticeModal(noticeId = null) {
    const isEdit = noticeId !== null;
    const title = isEdit ? 'Edit Notice' : 'Create New Notice';
    
    const content = `
        <form id="noticeForm" class="modal-form" enctype="multipart/form-data">
            <div class="form-row">
                <div class="form-group">
                    <label for="noticeTitle">Notice Title *</label>
                    <input type="text" id="noticeTitle" name="title" required maxlength="200" 
                           placeholder="Enter notice title">
                </div>
                <div class="form-group">
                    <label for="noticeCategory">Category *</label>
                    <select id="noticeCategory" name="category" required>
                        <option value="">Select Category</option>
                        <option value="General Announcement">General Announcement</option>
                        <option value="Service Update">Service Update</option>
                        <option value="Ministry News">Ministry News</option>
                        <option value="Prayer Request">Prayer Request</option>
                        <option value="Community News">Community News</option>
                        <option value="Emergency Notice">Emergency Notice</option>
                        <option value="Event Reminder">Event Reminder</option>
                        <option value="Policy Update">Policy Update</option>
                        <option value="Celebration">Celebration</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="noticeSummary">Summary</label>
                <textarea id="noticeSummary" name="summary" rows="2" maxlength="500"
                          placeholder="Brief summary of the notice (optional)"></textarea>
            </div>

            <div class="form-group">
                <label for="noticeContent">Content *</label>
                <textarea id="noticeContent" name="content" required rows="6" maxlength="5000"
                          placeholder="Enter notice content"></textarea>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="noticePriority">Priority</label>
                    <select id="noticePriority" name="priority">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="noticeAttachment">Attachment</label>
                    <input type="file" id="noticeAttachment" name="attachment" 
                           accept="image/*,.pdf,.doc,.docx">
                    <small class="form-help">Max 5MB. Images, PDF, DOC, DOCX allowed</small>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="publishDate">Publish Date</label>
                    <input type="datetime-local" id="publishDate" name="publishDate">
                </div>
                <div class="form-group">
                    <label for="expiryDate">Expiry Date</label>
                    <input type="datetime-local" id="expiryDate" name="expiryDate">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <div class="checkbox-group">
                        <input type="checkbox" id="isActive" name="isActive" checked>
                        <label for="isActive">Active</label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="noticeTags">Tags</label>
                    <input type="text" id="noticeTags" name="tags" 
                           placeholder="Enter tags separated by commas">
                </div>
            </div>

            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="modalManager.closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    ${isEdit ? 'Update Notice' : 'Create Notice'}
                </button>
            </div>
        </form>
    `;

    const modal = modalManager.createModal(title, content, 'large');
    
    // Set default publish date to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('publishDate').value = now.toISOString().slice(0, 16);
    
    // If editing, load notice data
    if (isEdit) {
        loadNoticeData(noticeId);
    }

    // Handle form submission
    document.getElementById('noticeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleNoticeSubmit(isEdit, noticeId);
    });
}

// Member Modal Functions
function openMemberModal(memberId = null) {
    const isEdit = memberId !== null;
    const title = isEdit ? 'Edit Member' : 'Add New Member';
    
    const content = `
        <form id="memberForm" class="modal-form" enctype="multipart/form-data">
            <div class="form-row">
                <div class="form-group">
                    <label for="memberName">Full Name *</label>
                    <input type="text" id="memberName" name="name" required maxlength="100" 
                           placeholder="Enter full name">
                </div>
                <div class="form-group">
                    <label for="memberEmail">Email Address *</label>
                    <input type="email" id="memberEmail" name="email" required 
                           placeholder="Enter email address">
                </div>
            </div>

            ${!isEdit ? `
            <div class="form-group">
                <label for="memberPassword">Password *</label>
                <input type="password" id="memberPassword" name="password" required minlength="6"
                       placeholder="Enter password (minimum 6 characters)">
            </div>
            ` : ''}

            <div class="form-row">
                <div class="form-group">
                    <label for="memberPhone">Phone Number</label>
                    <input type="tel" id="memberPhone" name="phone" 
                           placeholder="Enter phone number">
                </div>
                <div class="form-group">
                    <label for="memberGender">Gender</label>
                    <select id="memberGender" name="gender">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="memberDateOfBirth">Date of Birth</label>
                    <input type="date" id="memberDateOfBirth" name="dateOfBirth">
                </div>
                <div class="form-group">
                    <label for="memberMaritalStatus">Marital Status</label>
                    <select id="memberMaritalStatus" name="maritalStatus">
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="memberAddress">Address</label>
                <textarea id="memberAddress" name="address" rows="2" 
                          placeholder="Enter home address"></textarea>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="memberOccupation">Occupation</label>
                    <input type="text" id="memberOccupation" name="occupation" 
                           placeholder="Enter occupation">
                </div>
                <div class="form-group">
                    <label for="memberRole">Role</label>
                    <select id="memberRole" name="role">
                        <option value="member">Member</option>
                        <option value="leader">Leader</option>
                        <option value="pastor">Pastor</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="membershipDate">Membership Date</label>
                    <input type="date" id="membershipDate" name="membershipDate">
                </div>
                <div class="form-group">
                    <label for="baptismDate">Baptism Date</label>
                    <input type="date" id="baptismDate" name="baptismDate">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="memberMinistries">Ministries</label>
                    <input type="text" id="memberMinistries" name="ministries" 
                           placeholder="Enter ministries separated by commas">
                </div>
                <div class="form-group">
                    <label for="memberSkills">Skills</label>
                    <input type="text" id="memberSkills" name="skills" 
                           placeholder="Enter skills separated by commas">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="memberProfilePicture">Profile Picture</label>
                    <input type="file" id="memberProfilePicture" name="profilePicture" accept="image/*">
                    <small class="form-help">Maximum file size: 2MB. Supported formats: JPEG, PNG, GIF, WebP</small>
                </div>
                <div class="form-group">
                    <div class="checkbox-group">
                        <input type="checkbox" id="memberIsActive" name="isActive" checked>
                        <label for="memberIsActive">Active Member</label>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label for="emergencyContact">Emergency Contact</label>
                <textarea id="emergencyContact" name="emergencyContact" rows="2" 
                          placeholder="Emergency contact information (name, relationship, phone)"></textarea>
            </div>

            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="modalManager.closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    ${isEdit ? 'Update Member' : 'Add Member'}
                </button>
            </div>
        </form>
    `;

    const modal = modalManager.createModal(title, content, 'large');
    
    // Set default membership date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('membershipDate').value = today;
    
    // If editing, load member data
    if (isEdit) {
        loadMemberData(memberId);
    }

    // Handle form submission
    document.getElementById('memberForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleMemberSubmit(isEdit, memberId);
    });
}

// Helper Functions
async function loadOrganizers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users?role=pastor&role=leader&role=admin`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        const select = document.getElementById('eventOrganizer');
        
        if (data.success && data.data.length > 0) {
            select.innerHTML = '<option value="">Select Organizer (Optional)</option>';
            data.data.forEach(user => {
                select.innerHTML += `<option value="${user._id}">${user.name} (${user.role})</option>`;
            });
        } else {
            select.innerHTML = '<option value="">No organizers available</option>';
        }
    } catch (error) {
        console.error('Error loading organizers:', error);
        document.getElementById('eventOrganizer').innerHTML = '<option value="">Error loading organizers</option>';
    }
}

async function loadEventData(eventId) {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const event = data.data;
            
            // Populate form fields
            document.getElementById('eventTitle').value = event.title || '';
            document.getElementById('eventCategory').value = event.category || '';
            document.getElementById('eventDescription').value = event.description || '';
            document.getElementById('eventDate').value = event.date ? event.date.split('T')[0] : '';
            document.getElementById('eventTime').value = event.time || '';
            document.getElementById('eventLocation').value = event.location || '';
            document.getElementById('registrationRequired').checked = event.registrationRequired || false;
            document.getElementById('maxAttendees').value = event.maxAttendees || '';
            document.getElementById('isFeatured').checked = event.isFeatured || false;
            document.getElementById('eventTags').value = event.tags ? event.tags.join(', ') : '';
            
            if (event.organizer && event.organizer._id) {
                document.getElementById('eventOrganizer').value = event.organizer._id;
            }
        }
    } catch (error) {
        console.error('Error loading event data:', error);
        showNotification('Error loading event data', 'error');
    }
}

async function loadNoticeData(noticeId) {
    try {
        const response = await fetch(`${API_BASE_URL}/notices/${noticeId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const notice = data.data;
            
            // Populate form fields
            document.getElementById('noticeTitle').value = notice.title || '';
            document.getElementById('noticeCategory').value = notice.category || '';
            document.getElementById('noticeSummary').value = notice.summary || '';
            document.getElementById('noticeContent').value = notice.content || '';
            document.getElementById('noticePriority').value = notice.priority || 'medium';
            document.getElementById('isActive').checked = notice.isActive !== false;
            document.getElementById('noticeTags').value = notice.tags ? notice.tags.join(', ') : '';
            
            if (notice.publishDate) {
                const publishDate = new Date(notice.publishDate);
                publishDate.setMinutes(publishDate.getMinutes() - publishDate.getTimezoneOffset());
                document.getElementById('publishDate').value = publishDate.toISOString().slice(0, 16);
            }
            
            if (notice.expiryDate) {
                const expiryDate = new Date(notice.expiryDate);
                expiryDate.setMinutes(expiryDate.getMinutes() - expiryDate.getTimezoneOffset());
                document.getElementById('expiryDate').value = expiryDate.toISOString().slice(0, 16);
            }
        }
    } catch (error) {
        console.error('Error loading notice data:', error);
        showNotification('Error loading notice data', 'error');
    }
}

async function loadMemberData(memberId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${memberId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const member = data.data;
            
            // Populate form fields
            document.getElementById('memberName').value = member.name || '';
            document.getElementById('memberEmail').value = member.email || '';
            document.getElementById('memberPhone').value = member.phone || '';
            document.getElementById('memberGender').value = member.gender || '';
            document.getElementById('memberMaritalStatus').value = member.maritalStatus || '';
            document.getElementById('memberAddress').value = member.address || '';
            document.getElementById('memberOccupation').value = member.occupation || '';
            document.getElementById('memberRole').value = member.role || 'member';
            document.getElementById('memberIsActive').checked = member.isActive !== false;
            document.getElementById('emergencyContact').value = member.emergencyContact || '';
            
            if (member.dateOfBirth) {
                document.getElementById('memberDateOfBirth').value = member.dateOfBirth.split('T')[0];
            }
            if (member.membershipDate) {
                document.getElementById('membershipDate').value = member.membershipDate.split('T')[0];
            }
            if (member.baptismDate) {
                document.getElementById('baptismDate').value = member.baptismDate.split('T')[0];
            }
            
            document.getElementById('memberMinistries').value = member.ministries ? member.ministries.join(', ') : '';
            document.getElementById('memberSkills').value = member.skills ? member.skills.join(', ') : '';
        }
    } catch (error) {
        console.error('Error loading member data:', error);
        showNotification('Error loading member data', 'error');
    }
}

// Form submission handlers
async function handleEventSubmit(isEdit, eventId) {
    const form = document.getElementById('eventForm');
    const formData = new FormData(form);
    
    try {
        const url = isEdit ? `${API_BASE_URL}/events/${eventId}` : `${API_BASE_URL}/events`;
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(data.message || `Event ${isEdit ? 'updated' : 'created'} successfully`, 'success');
            modalManager.closeModal();
            loadEventsData(); // Refresh the events table
        } else {
            showNotification(data.message || 'Error saving event', 'error');
        }
    } catch (error) {
        console.error('Error saving event:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

async function handleNoticeSubmit(isEdit, noticeId) {
    const form = document.getElementById('noticeForm');
    const formData = new FormData(form);
    
    try {
        const url = isEdit ? `${API_BASE_URL}/notices/${noticeId}` : `${API_BASE_URL}/notices`;
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(data.message || `Notice ${isEdit ? 'updated' : 'created'} successfully`, 'success');
            modalManager.closeModal();
            loadNoticesData(); // Refresh the notices table
        } else {
            showNotification(data.message || 'Error saving notice', 'error');
        }
    } catch (error) {
        console.error('Error saving notice:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

async function handleMemberSubmit(isEdit, memberId) {
    const form = document.getElementById('memberForm');
    const formData = new FormData(form);
    
    try {
        const url = isEdit ? `${API_BASE_URL}/users/${memberId}` : `${API_BASE_URL}/users`;
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(data.message || `Member ${isEdit ? 'updated' : 'added'} successfully`, 'success');
            modalManager.closeModal();
            loadMembersData(); // Refresh the members table
        } else {
            showNotification(data.message || 'Error saving member', 'error');
        }
    } catch (error) {
        console.error('Error saving member:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Export functions for global access
window.openEventModal = openEventModal;
window.openNoticeModal = openNoticeModal;
window.openMemberModal = openMemberModal;

console.log('Admin modals loaded successfully! 🎉');