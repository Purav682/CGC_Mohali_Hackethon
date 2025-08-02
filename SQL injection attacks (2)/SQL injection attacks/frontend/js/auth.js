// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const loginBtn = document.getElementById('loginBtn');
  const errorMsg = document.getElementById('errorMsg');

  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    window.location.href = 'index.html';
  } catch (error) {
    errorMsg.textContent = error.message;
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
  }
});

// Redirect if already logged in
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) window.location.href = 'index.html';
});