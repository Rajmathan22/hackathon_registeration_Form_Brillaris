// Global variables
let currentStep = 1;
const totalSteps = 5;
let formData = {};

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeForm();
    setupFileUploads();
    setupFormValidation();
});

function initializeForm() {
    updateProgress();
    loadSavedData();
    console.log('Form initialized');
}

function nextStep() {
    if (validateCurrentStep()) {
        saveCurrentStepData();
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
            updateProgress();
            updateStepIndicators();
        }
    }
}

function prevStep() {
    saveCurrentStepData();
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateProgress();
        updateStepIndicators();
    }
}

function showStep(stepNumber) {
    // Hide all steps
    const allSteps = document.querySelectorAll('.form-step');
    allSteps.forEach(step => {
        step.classList.remove('active');
    });

    // Show current step
    const currentStepElement = document.getElementById(`step${stepNumber}`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');

        // Focus on first input
        const firstInput = currentStepElement.querySelector('input, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 300);
        }
    }

    // Generate confirmation summary if on last step
    if (stepNumber === 5) {
        generateConfirmationSummary();
    }
}

function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;

    // Clear previous errors
    currentStepElement.querySelectorAll('.error-message').forEach(error => {
        error.classList.remove('show');
    });

    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    // Special validation for step 3 (participation type)
    if (currentStep === 3) {
        const participationType = document.querySelector('input[name="participationType"]:checked');
        if (!participationType) {
            showError('participationTypeError', 'Please select your participation type');
            isValid = false;
        } else if (participationType.value === 'team') {
            const teamSize = document.getElementById('teamSize').value;
            if (!teamSize) {
                showError('teamSizeError', 'Please select team size');
                isValid = false;
            } else {
                // Validate team member fields
                const teamMemberInputs = document.querySelectorAll('#teamMemberFields input[required]');
                teamMemberInputs.forEach(input => {
                    if (!input.value.trim()) {
                        showError(input.name + 'Error', 'This field is required');
                        isValid = false;
                    }
                });
            }
        }
    }

    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;

    // Required field validation
    if (field.hasAttribute('required') && !value) {
        showError(`${fieldName}Error`, 'This field is required');
        return false;
    }

    // Specific field validations
    switch (fieldName) {
        case 'firstName':
        case 'lastName':
            if (value && value.length < 1) {
                showError(`${fieldName}Error`, 'Name must be at least 2 characters long');
                isValid = false;
            }
            break;

        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                showError('emailError', 'Please enter a valid email address');
                isValid = false;
            }
            break;

        case 'phone':
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (value && !phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                showError('phoneError', 'Please enter a valid phone number');
                isValid = false;
            }
            break;

        case 'pdf1':
            if (field.files.length > 0) {
                const file = field.files[0];
                if (file.type !== 'application/pdf') {
                    showError('pdf1Error', 'Please upload a PDF file');
                    isValid = false;
                } else if (file.size > 10 * 1024 * 1024) {
                    showError('pdf1Error', 'File size must be less than 10MB');
                    isValid = false;
                }
            }
            break;
    }

    return isValid;
}

function showError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');

        // Add shake animation
        const parentGroup = errorElement.closest('.form-group');
        if (parentGroup) {
            parentGroup.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                parentGroup.style.animation = '';
            }, 500);
        }
    }
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressPercentage = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${progressPercentage}%`;
}

function updateStepIndicators() {
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
        const stepNumber = index + 1;

        indicator.classList.remove('active', 'completed');

        if (stepNumber === currentStep) {
            indicator.classList.add('active');
        } else if (stepNumber < currentStep) {
            indicator.classList.add('completed');
            indicator.innerHTML = '<i class="fas fa-check"></i>';
        } else {
            indicator.textContent = stepNumber;
        }
    });
}

function toggleTeamDetails() {
    const teamRadio = document.getElementById('team');
    const teamDetails = document.getElementById('teamDetails');

    if (teamRadio.checked) {
        teamDetails.classList.remove('hidden');
    } else {
        teamDetails.classList.add('hidden');
        // Clear team member fields
        document.getElementById('teamMemberFields').innerHTML = '';
        document.getElementById('teamSize').value = '';
    }
}

function generateTeamMemberFields() {
    const teamSize = parseInt(document.getElementById('teamSize').value);
    const container = document.getElementById('teamMemberFields');

    container.innerHTML = '';

    // Generate fields for team members (excluding the person filling the form)
    for (let i = 2; i <= teamSize; i++) {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'team-member-group';
        memberDiv.innerHTML = `
            <div class="team-member-title">
                <i class="fas fa-user"></i>
                Team Member ${i}
            </div>
            <div class="team-member-row">
                <div class="form-group">
                    <label class="form-label">First Name *</label>
                    <input type="text" name="teamMember${i}FirstName" class="form-input" placeholder="First name" required>
                    <div class="error-message" id="teamMember${i}FirstNameError"></div>
                </div>
                <div class="form-group">
                    <label class="form-label">Last Name *</label>
                    <input type="text" name="teamMember${i}LastName" class="form-input" placeholder="Last name" required>
                    <div class="error-message" id="teamMember${i}LastNameError"></div>
                </div>
            </div>
            <div class="team-member-row">
                <div class="form-group">
                    <label class="form-label">Email *</label>
                    <input type="email" name="teamMember${i}Email" class="form-input" placeholder="Email address" required>
                    <div class="error-message" id="teamMember${i}EmailError"></div>
                </div>
                <div class="form-group">
                    <label class="form-label">Phone *</label>
                    <input type="tel" name="teamMember${i}Phone" class="form-input" placeholder="Phone number" required>
                    <div class="error-message" id="teamMember${i}PhoneError"></div>
                </div>
            </div>
        `;
        container.appendChild(memberDiv);
    }
}

function setupFileUploads() {
    const fileInputs = document.querySelectorAll('.file-input');

    fileInputs.forEach(input => {
        const uploadArea = input.closest('.file-upload-area');
        const label = uploadArea.querySelector('.file-upload-label span');

        // File selection
        input.addEventListener('change', function () {
            if (this.files.length > 0) {
                const fileName = this.files[0].name;
                label.textContent = `Selected: ${fileName}`;
                uploadArea.classList.add('file-selected');
            } else {
                label.textContent = 'Click to upload or drag and drop';
                uploadArea.classList.remove('file-selected');
            }
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', function (e) {
            e.preventDefault();
            this.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', function () {
            this.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', function (e) {
            e.preventDefault();
            this.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                input.files = files;
                input.dispatchEvent(new Event('change'));
            }
        });
    });
}

function setupFormValidation() {
    const fields = document.querySelectorAll('.form-input, .form-select');
    fields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
            clearError(field);
            // Real-time validation for email and phone
            if (field.type === 'email' || field.type === 'tel') {
                debounce(() => checkFieldAvailability(field), 500)();
            }
        });
    });
}

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if email or phone is already registered
async function checkFieldAvailability(field) {
    if (!field.value.trim()) return;

    let type = '';
    if (field.type === 'email') {
        type = 'email';
        if (!isValidEmail(field.value)) return;
    } else if (field.type === 'tel') {
        type = 'phone';
        if (!isValidPhone(field.value)) return;
    } else {
        return;
    }

    try {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('value', field.value);

        const response = await fetch('validate.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.exists) {
            showError(field, result.message);
        } else {
            clearError(field);
        }
    } catch (error) {
        console.error('Validation error:', error);
    }
}

function saveCurrentStepData() {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    const inputs = currentStepElement.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            formData[input.name] = input.checked;
        } else if (input.type === 'radio') {
            if (input.checked) {
                formData[input.name] = input.value;
            }
        } else if (input.type === 'file') {
            if (input.files.length > 0) {
                formData[input.name] = {
                    name: input.files[0].name,
                    size: input.files[0].size,
                    type: input.files[0].type
                };
            }
        } else {
            formData[input.name] = input.value;
        }
    });

    // Save to localStorage
    localStorage.setItem('hackathonFormData', JSON.stringify(formData));
    localStorage.setItem('hackathonFormCurrentStep', currentStep);
}

function loadSavedData() {
    const savedData = localStorage.getItem('hackathonFormData');
    const savedStep = localStorage.getItem('hackathonFormCurrentStep');

    if (savedData) {
        formData = JSON.parse(savedData);
        populateForm();
    }

    if (savedStep && parseInt(savedStep) > 1) {
        if (confirm('Continue from where you left off?')) {
            currentStep = parseInt(savedStep);
            showStep(currentStep);
            updateProgress();
            updateStepIndicators();
        } else {
            clearSavedData();
        }
    }
}

function populateForm() {
    Object.keys(formData).forEach(key => {
        const value = formData[key];
        const input = document.querySelector(`input[name="${key}"], select[name="${key}"]`);

        if (input) {
            if (input.type === 'radio') {
                const radioButton = document.querySelector(`input[name="${key}"][value="${value}"]`);
                if (radioButton) radioButton.checked = true;
            } else if (input.type === 'checkbox') {
                input.checked = value;
            } else if (input.type !== 'file') {
                input.value = value;
            }
        }
    });
}

function clearSavedData() {
    localStorage.removeItem('hackathonFormData');
    localStorage.removeItem('hackathonFormCurrentStep');
    formData = {};
}

function generateConfirmationSummary() {
    const summaryContainer = document.getElementById('confirmationSummary');

    let summaryHTML = `
        <div class="summary-section">
            <div class="summary-title">
                <i class="fas fa-user"></i>
                Personal Information
            </div>
            <div class="summary-content">
                <div class="summary-item">
                    <span class="summary-label">Name:</span>
                    <span class="summary-value">${formData.firstName || ''} ${formData.lastName || ''}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Email:</span>
                    <span class="summary-value">${formData.email || ''}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Phone:</span>
                    <span class="summary-value">${formData.phone || ''}</span>
                </div>
            </div>
        </div>
        
        <div class="summary-section">
            <div class="summary-title">
                <i class="fas fa-graduation-cap"></i>
                Academic Information
            </div>
            <div class="summary-content">
                <div class="summary-item">
                    <span class="summary-label">College:</span>
                    <span class="summary-value">${formData.collegeName || ''}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Department:</span>
                    <span class="summary-value">${formData.department || ''}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Year:</span>
                    <span class="summary-value">${getYearText(formData.year)}</span>
                </div>
            </div>
        </div>
        
        <div class="summary-section">
            <div class="summary-title">
                <i class="fas fa-users"></i>
                Participation
            </div>
            <div class="summary-content">
                <div class="summary-item">
                    <span class="summary-label">Type:</span>
                    <span class="summary-value">${formData.participationType === 'solo' ? 'Solo Participation' : 'Team Participation'}</span>
                </div>
                ${formData.participationType === 'team' ? `
                    <div class="summary-item">
                        <span class="summary-label">Team Size:</span>
                        <span class="summary-value">${formData.teamSize || ''} members</span>
                    </div>
                ` : ''}
            </div>
        </div>
        
        <div class="summary-section">
            <div class="summary-title">
                <i class="fas fa-file-pdf"></i>
                Documents
            </div>
            <div class="summary-content">
                <div class="summary-item">
                    <span class="summary-label">Concept Proposal:</span>
                    <span class="summary-value">${formData.pdf1 ? formData.pdf1.name : 'Not uploaded'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Presentation:</span>
                    <span class="summary-value">${formData.pdf2 ? formData.pdf2.name : 'Not uploaded'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Additional Document:</span>
                    <span class="summary-value">${formData.pdf3 ? formData.pdf3.name : 'Not uploaded'}</span>
                </div>
            </div>
        </div>
    `;

    summaryContainer.innerHTML = summaryHTML;
}

function getYearText(year) {
    switch (year) {
        case '1': return '1st Year';
        case '2': return '2nd Year';
        case '3': return '3rd Year';
        case '4': return '4th Year';
        case 'postgrad': return 'Post Graduate';
        default: return '';
    }
}

// Form submission
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('hackathonForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!validateCurrentStep()) return;

        saveCurrentStepData();
        generateConfirmationSummary();

        // Show loading
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.classList.remove('hidden');

        try {
            // Prepare form data for submission
            const submissionFormData = new FormData();

            // Add all form fields
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    submissionFormData.append(key, formData[key]);
                }
            });

            // Add team member data if team participation
            if (formData.participationType === 'team' && formData.teamSize) {
                for (let i = 1; i < parseInt(formData.teamSize); i++) {
                    const memberData = formData[`teamMember${i}`];
                    if (memberData) {
                        Object.keys(memberData).forEach(field => {
                            submissionFormData.append(`teamMember${i}${field.charAt(0).toUpperCase() + field.slice(1)}`, memberData[field]);
                        });
                    }
                }
            }

            // Add file uploads
            const fileInputs = ['pdf1', 'pdf2', 'pdf3'];
            fileInputs.forEach(inputId => {
                const fileInput = document.getElementById(inputId);
                if (fileInput && fileInput.files.length > 0) {
                    submissionFormData.append(inputId, fileInput.files[0]);
                }
            });

            // Add agreement
            const agreementCheckbox = document.getElementById('agreement');
            submissionFormData.append('agreement', agreementCheckbox.checked ? 'true' : 'false');

            // Submit to PHP backend
            const response = await fetch('register.php', {
                method: 'POST',
                body: submissionFormData
            });

            // Check if the response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('Non-JSON response:', textResponse);
                throw new Error('Server returned invalid response format');
            }

            const result = await response.json();

            if (result.success) {
                // Show success with registration ID
                showSuccessMessage(result.registration_id);
                clearSavedData();
            } else {
                throw new Error(result.error || 'Registration failed');
            }

        } catch (error) {
            console.error('Registration error:', error);
            
            // More detailed error messages
            let errorMessage = 'Registration failed: ';
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage += 'Cannot connect to server. Please check if the server is running and try again.';
            } else if (error.message.includes('HTTP error')) {
                errorMessage += `Server error (${error.message}). Please try again later.`;
            } else {
                errorMessage += error.message;
            }
            
            alert(errorMessage);
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    });
});

function showSuccessMessage(registrationId = null) {
    const form = document.getElementById('hackathonForm');
    const successScreen = document.getElementById('successMessage');
    const progressContainer = document.querySelector('.progress-container');

    form.style.display = 'none';
    progressContainer.style.display = 'none';
    successScreen.classList.remove('hidden');

    // Add registration ID to success message if provided
    if (registrationId) {
        const successContent = successScreen.querySelector('.success-content');
        const registrationIdElement = document.createElement('div');
        registrationIdElement.className = 'detail-item';
        registrationIdElement.innerHTML = `
            <i class="fas fa-id-card"></i>
            <span>Registration ID: <strong>#${registrationId}</strong></span>
        `;
        successContent.querySelector('.success-details').appendChild(registrationIdElement);
    }

    // Add show class for proper animation and visibility
    setTimeout(() => {
        successScreen.classList.add('show');
    }, 100);
}

function downloadConfirmation() {
    // Create a simple text confirmation
    const confirmationText = `
HACKATHON REGISTRATION CONFIRMATION

Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}
College: ${formData.collegeName}
Department: ${formData.department}
Year: ${getYearText(formData.year)}
Participation: ${formData.participationType === 'solo' ? 'Solo' : 'Team'}

Event: TechHack 2025
Date: March 15-17, 2025
Location: Tech Innovation Center

Thank you for registering!
    `;

    const blob = new Blob([confirmationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hackathon-confirmation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}