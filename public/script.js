document.addEventListener('DOMContentLoaded', () => {
  const togglePassword = document.getElementById('togglePassword');
  const passwordField = document.getElementById('password');

  if (togglePassword && passwordField) {
    togglePassword.addEventListener('click', () => {
      const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordField.setAttribute('type', type);
      togglePassword.classList.toggle('fa-eye-slash');
    });
  }

  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const postProjectForm = document.getElementById('postProjectForm');
  const projectList = document.getElementById('projectList');

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const res = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        alert(data.message);
      } catch (err) {
        console.error(err);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const res = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (res.status === 200) {
          localStorage.setItem('userId', data.userId);  // Store userId in localStorage
          alert('Login successful');
          window.location.href = '/dashboard.html';
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred during login.');
      }
    });
  }

  if (postProjectForm) {
    postProjectForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const githubLink = document.getElementById('githubLink').value;
      const thumbnail = document.getElementById('thumbnail').files[0];
      
      const userId = localStorage.getItem('userId');  // Make sure to set userId after login

      if (!userId) {
        alert("User not logged in.");
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('githubLink', githubLink);
      formData.append('thumbnail', thumbnail);
      formData.append('userId', userId); // Send userId with form data

      try {
        const res = await fetch('http://localhost:5000/api/projects', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        alert(data.message);
      } catch (err) {
        console.error(err);
      }
    });
  }

  if (projectList) {
    async function loadProjects() {
      try {
        const res = await fetch('http://localhost:5000/api/projects');
        const projects = await res.json();

        projects.forEach((project) => {
          const projectCard = `
            <div class="project-card">
              <img src="${project.thumbnail}" alt="Project Thumbnail">
              <h3>${project.title}</h3>
              <p>${project.description}</p>
              <a href="${project.githubLink}" target="_blank">GitHub Repository</a>
              <p>Uploaded by: ${project.user.email}</p>
            </div>
          `;
          projectList.innerHTML += projectCard;
        });
      } catch (err) {
        console.error(err);
      }
    }

    loadProjects();
  }
});


document.addEventListener('DOMContentLoaded', () => {
  // Toggle password visibility
  const togglePassword = document.getElementById('togglePassword');
  const passwordField = document.getElementById('password');

  togglePassword.addEventListener('click', () => {
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye-slash');
  });

  // Forgot Password Modal handling
  const forgotPasswordLink = document.querySelector('.forgot-password');
  const forgotPasswordModal = document.getElementById('forgotPasswordModal');
  const closeModalBtn = document.getElementById('closeModal');

  // Show modal when clicking 'Forgot Password'
  forgotPasswordLink.addEventListener('click', () => {
    forgotPasswordModal.style.display = 'block';
  });

  // Close modal when clicking 'x' button
  closeModalBtn.addEventListener('click', () => {
    forgotPasswordModal.style.display = 'none';
  });

  // Close modal when clicking outside of the modal
  window.addEventListener('click', (event) => {
    if (event.target === forgotPasswordModal) {
      forgotPasswordModal.style.display = 'none';
    }
  });

  // Handle forgot password form submission
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;

    try {
      const res = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert('An error occurred while sending the reset link.');
    }
  });

  // Handle login form submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const res = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.status === 200) {
          localStorage.setItem('userId', data.userId);  // Store userId in localStorage
          alert('Login successful');
          window.location.href = '/dashboard.html';
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred during login.');
      }
    });
  }

  // Handle registration form submission
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const res = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        alert(data.message);
        if (data.success) {
          window.location.href = '/login.html'; // Redirect to login after successful registration
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred during registration.');
      }
    });
  }

  // Handle reset password form submission
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword }),
        });

        const data = await res.json();
        alert(data.message);
        if (data.success) {
          window.location.href = '/login.html'; // Redirect to login after successful password reset
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred during password reset.');
      }
    });
  }
});



  
