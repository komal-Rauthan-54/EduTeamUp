// ==========================================
// GEHU WEBSITE - ENHANCED JAVASCRIPT SYSTEM
// ==========================================

// Check if we're on the dashboard page and redirect if not signed in
if (window.location.pathname.includes('dashboard.html')) {
    const userData = JSON.parse(localStorage.getItem('gehuUser') || '{}');
    if (!userData.signedIn) {
        window.location.href = 'index.html';
    } else {
        initDashboard();
    }
} else {
    // We're on the index page
    initIndexPage();
}

// ==========================================
// INDEX PAGE FUNCTIONALITY
// ==========================================

function initIndexPage() {
    // Check if user is already signed in and redirect to dashboard
    const userData = JSON.parse(localStorage.getItem('gehuUser') || '{}');
    if (userData.signedIn) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Gate all calls to action - redirect to signup if not signed in
    setupGatedActions();
    
    // Handle the signup form
    setupSignupForm();
    
    // Setup smooth scrolling for anchor links
    setupSmoothScrolling();
    
    // Add loading effects to buttons
    setupButtonEffects();
}

function setupGatedActions() {
    // Gate navigation links
    document.querySelectorAll('header nav a[data-nav]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // Redirect to signup section
            scrollToSignup();
        });
    });
    
    // Gate "Learn More" button
    document.querySelectorAll('.btn[data-gate]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (this.getAttribute('data-gate') === 'learn') {
                scrollToSignup();
            } else {
                // For signup button, just scroll to signup
                scrollToSignup();
            }
        });
    });
    
    // Gate all "Join Group" buttons
    document.querySelectorAll('.join-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToSignup();
        });
    });
}

function scrollToSignup() {
    const signupSection = document.getElementById('signup');
    if (signupSection) {
        signupSection.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        
        // Add a subtle highlight effect
        const mainContent = signupSection.closest('.main-content');
        if (mainContent) {
            mainContent.style.boxShadow = '0 20px 40px rgba(0, 123, 255, 0.2), 0 0 0 2px rgba(0, 123, 255, 0.1)';
            setTimeout(() => {
                mainContent.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.1)';
            }, 2000);
        }
    }
}

function setupSignupForm() {
    const signupForm = document.getElementById('signup-form');
    if (!signupForm) return;
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const domain = document.getElementById('domain').value;
        
        if (!name || !email || !domain) {
            alert('⚠️ Please complete all required fields to continue!');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('⚠️ Please enter a valid email address!');
            return;
        }
        
        // Store user data in localStorage with enhanced structure
        const userData = {
            name: name,
            email: email,
            domain: domain,
            signedIn: true,
            signupDate: new Date().toISOString(),
            joinedTeams: [] // Initialize empty joined teams array
        };
        
        localStorage.setItem('gehuUser', JSON.stringify(userData));
        
        // Initialize teams array if it doesn't exist
        if (!localStorage.getItem('gehuTeams')) {
            localStorage.setItem('gehuTeams', JSON.stringify([]));
        }
        
        // Show success message and redirect
        alert(`🎉 Welcome to GEHU, ${name}!\n\nYour registration for ${domain} has been received.\n\nRedirecting to your dashboard...`);
        
        // Small delay for better UX, then redirect
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    });
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]:not([data-nav]):not([data-gate])').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupButtonEffects() {
    document.querySelectorAll('button:not(.join-btn)').forEach(button => {
        button.addEventListener('click', function() {
            if (this.type === 'submit') return; // Don't interfere with form submission
            
            const originalText = this.textContent;
            this.textContent = 'Processing...';
            this.disabled = true;
            
            setTimeout(() => {
                this.textContent = originalText;
                this.disabled = false;
            }, 1500);
        });
    });
}

// ==========================================
// DASHBOARD PAGE FUNCTIONALITY
// ==========================================

function initDashboard() {
    const userData = JSON.parse(localStorage.getItem('gehuUser'));
    
    // Ensure joinedTeams array exists (for backwards compatibility)
    if (!userData.joinedTeams) {
        userData.joinedTeams = [];
        localStorage.setItem('gehuUser', JSON.stringify(userData));
    }
    
    // Update welcome message
    document.getElementById('welcome-message').textContent = `Welcome, ${userData.name}!`;
    document.getElementById('user-info').textContent = `Your domain: ${userData.domain} | Member since ${new Date(userData.signupDate).toLocaleDateString()}`;
    
    // Update dashboard statistics
    updateDashboardStats();
    
    // Display joined teams
    displayJoinedTeams();
    
    // Check and update team limit warning
    checkTeamLimit();
    
    // Setup dashboard functionality
    setupCreateTeamForm();
    setupTeamJoining();
}

function updateDashboardStats() {
    const userData = JSON.parse(localStorage.getItem('gehuUser'));
    const teams = JSON.parse(localStorage.getItem('gehuTeams') || '[]');
    
    const joinedTeamsCount = userData.joinedTeams ? userData.joinedTeams.length : 0;
    const availableTeamsCount = teams.length;
    const slotsRemaining = Math.max(0, 3 - joinedTeamsCount);
    
    // Update stat numbers
    document.getElementById('joined-teams-count').textContent = joinedTeamsCount;
    document.getElementById('teams-available').textContent = availableTeamsCount;
    document.getElementById('team-slots-remaining').textContent = slotsRemaining;
}

function displayJoinedTeams() {
    const userData = JSON.parse(localStorage.getItem('gehuUser'));
    const teams = JSON.parse(localStorage.getItem('gehuTeams') || '[]');
    const joinedTeamsContainer = document.getElementById('joined-teams-container');
    
    if (!userData.joinedTeams || userData.joinedTeams.length === 0) {
        joinedTeamsContainer.innerHTML = `
            <div class="no-joined-teams">
                You haven't joined any teams yet. Start by joining a team below! 🚀
            </div>
        `;
        return;
    }
    
    // Filter teams to show only joined ones
    const joinedTeams = teams.filter(team => userData.joinedTeams.includes(team.id));
    
    if (joinedTeams.length === 0) {
        joinedTeamsContainer.innerHTML = `
            <div class="no-joined-teams">
                Some of your joined teams may no longer exist. You can join new teams below! 🚀
            </div>
        `;
        return;
    }
    
    // Generate HTML for joined teams
    let joinedTeamsHTML = '<div class="joined-teams-grid">';
    
    joinedTeams.forEach(team => {
        const fillPercentage = Math.round((team.members / team.maxMembers) * 100);
        
        joinedTeamsHTML += `
            <div class="joined-team-card">
                <div class="team-domain">${team.domain}</div>
                <h4>${team.name}</h4>
                <p>${team.description}</p>
                <div class="team-members">
                    👥 ${team.members}/${team.maxMembers} members (${fillPercentage}% full)
                </div>
            </div>
        `;
    });
    
    joinedTeamsHTML += '</div>';
    joinedTeamsContainer.innerHTML = joinedTeamsHTML;
}

function checkTeamLimit() {
    const userData = JSON.parse(localStorage.getItem('gehuUser'));
    const joinedTeamsCount = userData.joinedTeams ? userData.joinedTeams.length : 0;
    const warningElement = document.getElementById('team-limit-warning');
    const joinTeamBtn = document.getElementById('join-team-btn');
    
    if (joinedTeamsCount >= 3) {
        // Show warning and disable join button
        warningElement.style.display = 'block';
        joinTeamBtn.classList.add('disabled');
        joinTeamBtn.textContent = 'Maximum Teams Reached';
        joinTeamBtn.onclick = function() {
            alert('🚫 You have already joined the maximum of 3 teams!\n\nYou cannot join any more teams at this time.');
        };
    } else {
        // Hide warning and enable join button
        warningElement.style.display = 'none';
        joinTeamBtn.classList.remove('disabled');
        joinTeamBtn.textContent = 'Join a Team';
        joinTeamBtn.onclick = showJoinTeam;
    }
}

function showCreateTeam() {
    document.getElementById('main-actions').style.display = 'none';
    document.getElementById('create-team-container').classList.add('active');
    
    // Pre-populate domain
    const userData = JSON.parse(localStorage.getItem('gehuUser'));
    document.getElementById('team-domain').value = userData.domain;
}

function showJoinTeam() {
    const userData = JSON.parse(localStorage.getItem('gehuUser'));
    const joinedTeamsCount = userData.joinedTeams ? userData.joinedTeams.length : 0;
    
    // Check team limit before showing join page
    if (joinedTeamsCount >= 3) {
        alert('🚫 You have already joined the maximum of 3 teams!\n\nYou cannot join any more teams at this time.');
        return;
    }
    
    document.getElementById('main-actions').style.display = 'none';
    document.getElementById('join-team-container').classList.add('active');
    loadAndDisplayTeams();
}

function showMainActions() {
    document.getElementById('main-actions').style.display = 'block';
    document.getElementById('create-team-container').classList.remove('active');
    document.getElementById('join-team-container').classList.remove('active');
    
    // Hide success message and reset form
    document.getElementById('create-success-message').style.display = 'none';
    document.getElementById('create-team-form').reset();
    
    // Pre-populate domain again
    const userData = JSON.parse(localStorage.getItem('gehuUser'));
    document.getElementById('team-domain').value = userData.domain;
    
    // Refresh dashboard data
    updateDashboardStats();
    displayJoinedTeams();
    checkTeamLimit();
}

function setupCreateTeamForm() {
    const createForm = document.getElementById('create-team-form');
    if (!createForm) return;
    
    createForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const teamName = document.getElementById('team-name').value.trim();
        const description = document.getElementById('team-description').value.trim();
        const maxMembers = parseInt(document.getElementById('max-members').value);
        const domain = document.getElementById('team-domain').value;
        
        if (!teamName || !description || !maxMembers || !domain) {
            alert('⚠️ Please fill in all fields!');
            return;
        }
        
        if (maxMembers < 2 || maxMembers > 50) {
            alert('⚠️ Maximum members must be between 2 and 50!');
            return;
        }
        
        const userData = JSON.parse(localStorage.getItem('gehuUser'));
        
        // Check if user already has 3 teams (including the one they're about to create)
        const currentJoinedCount = userData.joinedTeams ? userData.joinedTeams.length : 0;
        if (currentJoinedCount >= 3) {
            alert('🚫 You have already joined the maximum of 3 teams!\n\nYou cannot create more teams at this time.');
            return;
        }
        
        // Create new team object
        const newTeam = {
            id: Date.now().toString(), // Simple ID generation
            name: teamName,
            description: description,
            maxMembers: maxMembers,
            domain: domain,
            members: 1, // Creator is the first member
            createdBy: userData.name,
            createdByEmail: userData.email,
            createdDate: new Date().toISOString(),
            memberEmails: [userData.email] // Track member emails for duplicate prevention
        };
        
        // Add to teams array
        const teams = JSON.parse(localStorage.getItem('gehuTeams') || '[]');
        teams.push(newTeam);
        localStorage.setItem('gehuTeams', JSON.stringify(teams));
        
        // Add team to user's joined teams
        if (!userData.joinedTeams) {
            userData.joinedTeams = [];
        }
        userData.joinedTeams.push(newTeam.id);
        localStorage.setItem('gehuUser', JSON.stringify(userData));
        
        // Show success message
        document.getElementById('create-success-message').style.display = 'block';
        
        // Reset form
        createForm.reset();
        document.getElementById('team-domain').value = userData.domain;
        
        // Update dashboard stats
        updateDashboardStats();
        displayJoinedTeams();
        checkTeamLimit();
        
        // Scroll to success message
        document.getElementById('create-success-message').scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    });
}

function setupTeamJoining() {
    // This will be called when teams are loaded
}

function loadAndDisplayTeams() {
    const teams = JSON.parse(localStorage.getItem('gehuTeams') || '[]');
    const userData = JSON.parse(localStorage.getItem('gehuUser'));
    const teamsContainer = document.getElementById('teams-list');
    
    if (teams.length === 0) {
        teamsContainer.innerHTML = '<div class="no-teams">No teams available yet. Be the first to create one!</div>';
        return;
    }
    
    // Filter out teams the user has already joined
    const availableTeams = teams.filter(team => 
        !userData.joinedTeams || !userData.joinedTeams.includes(team.id)
    );
    
    if (availableTeams.length === 0) {
        teamsContainer.innerHTML = '<div class="no-teams">You have already joined all available teams! 🎉</div>';
        return;
    }
    
    // Sort teams: user's domain first, then by fill percentage (descending)
    const sortedTeams = availableTeams.sort((a, b) => {
        // First priority: user's domain
        if (a.domain === userData.domain && b.domain !== userData.domain) return -1;
        if (b.domain === userData.domain && a.domain !== userData.domain) return 1;
        
        // Second priority: fill percentage (descending)
        const fillA = (a.members / a.maxMembers) * 100;
        const fillB = (b.members / b.maxMembers) * 100;
        return fillB - fillA;
    });
    
    // Generate HTML for teams
    let teamsHTML = '<div class="teams-grid">';
    
    sortedTeams.forEach(team => {
        const fillPercentage = Math.round((team.members / team.maxMembers) * 100);
        const isFull = team.members >= team.maxMembers;
        const isUserDomain = team.domain === userData.domain;
        const alreadyJoined = userData.joinedTeams && userData.joinedTeams.includes(team.id);
        
        teamsHTML += `
            <div class="team-card ${isUserDomain ? 'user-domain' : ''} ${alreadyJoined ? 'already-joined' : ''}">
                <div class="team-domain">${team.domain}</div>
                <h3>${team.name}</h3>
                <p>${team.description}</p>
                <div class="team-info">
                    <span class="members-count">${team.members}/${team.maxMembers} members</span>
                    <span class="fill-percentage">${fillPercentage}% full</span>
                </div>
                <button class="team-join-btn ${alreadyJoined ? 'already-joined' : ''}" 
                        onclick="joinTeam('${team.id}')" 
                        ${isFull || alreadyJoined ? 'disabled' : ''}>
                    ${alreadyJoined ? 'Already Joined' : (isFull ? 'Team Full' : 'Join Team')}
                </button>
            </div>
        `;
    });
    
    teamsHTML += '</div>';
    teamsContainer.innerHTML = teamsHTML;
}

function joinTeam(teamId) {
    const teams = JSON.parse(localStorage.getItem('gehuTeams') || '[]');
    const userData = JSON.parse(localStorage.getItem('gehuUser'));
    const teamIndex = teams.findIndex(team => team.id === teamId);
    
    if (teamIndex === -1) {
        alert('❌ Team not found!');
        return;
    }
    
    const team = teams[teamIndex];
    
    // Check if user has already joined this team
    if (userData.joinedTeams && userData.joinedTeams.includes(teamId)) {
        alert('⚠️ You have already joined this team!');
        return;
    }
    
    // Check if user has reached the maximum number of teams
    const currentJoinedCount = userData.joinedTeams ? userData.joinedTeams.length : 0;
    if (currentJoinedCount >= 3) {
        alert('🚫 You have already joined the maximum of 3 teams!\n\nYou cannot join any more teams at this time.');
        return;
    }
    
    // Check if team is full
    if (team.members >= team.maxMembers) {
        alert('❌ This team is already full!');
        return;
    }
    
    // Check if user's email is already in the team (double-check for data integrity)
    if (team.memberEmails && team.memberEmails.includes(userData.email)) {
        alert('⚠️ You have already joined this team!');
        return;
    }
    
    // Initialize memberEmails array if it doesn't exist (backwards compatibility)
    if (!team.memberEmails) {
        team.memberEmails = [];
    }
    
    // Add user to team
    teams[teamIndex].members += 1;
    teams[teamIndex].memberEmails.push(userData.email);
    localStorage.setItem('gehuTeams', JSON.stringify(teams));
    
    // Add team to user's joined teams
    if (!userData.joinedTeams) {
        userData.joinedTeams = [];
    }
    userData.joinedTeams.push(teamId);
    localStorage.setItem('gehuUser', JSON.stringify(userData));
    
    // Show success message
    alert(`🎉 Successfully joined "${team.name}"!\n\nYou are now member #${teams[teamIndex].members} of this team.\n\nTeams joined: ${userData.joinedTeams.length}/3`);
    
    // Update dashboard and reload teams display
    updateDashboardStats();
    displayJoinedTeams();
    checkTeamLimit();
    loadAndDisplayTeams();
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('gehuUser');
        window.location.href = 'index.html';
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Add some sample teams for demonstration (only if no teams exist)
function initializeSampleTeams() {
    const teams = JSON.parse(localStorage.getItem('gehuTeams') || '[]');
    if (teams.length === 0) {
        const sampleTeams = [
            {
                id: 'sample1',
                name: 'AI Research Group',
                description: 'Exploring cutting-edge artificial intelligence and machine learning technologies.',
                maxMembers: 8,
                domain: 'Computer Science',
                members: 3,
                createdBy: 'System',
                createdByEmail: 'system@gehu.ac.in',
                createdDate: new Date().toISOString(),
                memberEmails: ['student1@gehu.ac.in', 'student2@gehu.ac.in', 'student3@gehu.ac.in']
            },
            {
                id: 'sample2',
                name: 'Startup Incubator',
                description: 'Building the next generation of innovative startups and business solutions.',
                maxMembers: 12,
                domain: 'Business',
                members: 7,
                createdBy: 'System',
                createdByEmail: 'system@gehu.ac.in',
                createdDate: new Date().toISOString(),
                memberEmails: ['biz1@gehu.ac.in', 'biz2@gehu.ac.in', 'biz3@gehu.ac.in', 'biz4@gehu.ac.in', 'biz5@gehu.ac.in', 'biz6@gehu.ac.in', 'biz7@gehu.ac.in']
            },
            {
                id: 'sample3',
                name: 'Robotics Lab',
                description: 'Designing and building autonomous robots for various applications.',
                maxMembers: 6,
                domain: 'Engineering',
                members: 4,
                createdBy: 'System',
                createdByEmail: 'system@gehu.ac.in',
                createdDate: new Date().toISOString(),
                memberEmails: ['eng1@gehu.ac.in', 'eng2@gehu.ac.in', 'eng3@gehu.ac.in', 'eng4@gehu.ac.in']
            },
            {
                id: 'sample4',
                name: 'Data Science Collective',
                description: 'Analyzing big data to uncover insights and drive decision making.',
                maxMembers: 10,
                domain: 'Computer Science',
                members: 6,
                createdBy: 'System',
                createdByEmail: 'system@gehu.ac.in',
                createdDate: new Date().toISOString(),
                memberEmails: ['data1@gehu.ac.in', 'data2@gehu.ac.in', 'data3@gehu.ac.in', 'data4@gehu.ac.in', 'data5@gehu.ac.in', 'data6@gehu.ac.in']
            },
            {
                id: 'sample5',
                name: 'Creative Arts Studio',
                description: 'A collaborative space for artists, designers, and creative minds to showcase and develop their talents.',
                maxMembers: 15,
                domain: 'Arts',
                members: 8,
                createdBy: 'System',
                createdByEmail: 'system@gehu.ac.in',
                createdDate: new Date().toISOString(),
                memberEmails: ['art1@gehu.ac.in', 'art2@gehu.ac.in', 'art3@gehu.ac.in', 'art4@gehu.ac.in', 'art5@gehu.ac.in', 'art6@gehu.ac.in', 'art7@gehu.ac.in', 'art8@gehu.ac.in']
            },
            {
                id: 'sample6',
                name: 'Environmental Science Network',
                description: 'Dedicated to environmental research, sustainability projects, and green technology innovation.',
                maxMembers: 20,
                domain: 'Science',
                members: 12,
                createdBy: 'System',
                createdByEmail: 'system@gehu.ac.in',
                createdDate: new Date().toISOString(),
                memberEmails: ['env1@gehu.ac.in', 'env2@gehu.ac.in', 'env3@gehu.ac.in', 'env4@gehu.ac.in', 'env5@gehu.ac.in', 'env6@gehu.ac.in', 'env7@gehu.ac.in', 'env8@gehu.ac.in', 'env9@gehu.ac.in', 'env10@gehu.ac.in', 'env11@gehu.ac.in', 'env12@gehu.ac.in']
            }
        ];
        
        localStorage.setItem('gehuTeams', JSON.stringify(sampleTeams));
    }
}

// Initialize sample teams on first load
if (typeof window !== 'undefined') {
    initializeSampleTeams();
}