import { useEffect, useState } from 'react'
import './App.css'

function App({ url }: { url: String }) {

  const [csrfToken, setCsrfToken] = useState('');
  const [spinner, setSpinner] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    /*
    Retrieves a CSRF token upon loading the contact form.
    */
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Unable to retrieve CSRF token');
        }
        return response.json();
      })
      .then(data => {
        setCsrfToken(data.token);
        setSpinner(false);
      })
      .catch(error => {
        setError('Unable to load contact form');
        setSpinner(false);
      });
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  const submitForm = async (event) => {
    event.preventDefault();
    try {
      formData.csrfToken = csrfToken;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    }
  }

  const errorContent = (
    <p
      data-testid="error-message"
      id="contact-form-error-message"
    >
      {error}
    </p>
  );

  let content;
  if (success) {
    content = (
      <div>
        <p
          data-testid="success-message"
          id="contact-form-success-message"
        >
          Form submitted successfully
        </p>
      </div>
    );
  } else if (spinner) {
    content = <div id="contact-form-spinner"></div>
  } else {
    content = (
      <>
        <form onSubmit={submitForm}>
          <input
            data-testid="first-name"
            name="firstName"
            onChange={handleChange}
            placeholder="First Name"
            type="text"
            value={formData.firstName}
          />
          <input
            data-testid="last-name"
            name="lastName"
            onChange={handleChange}
            placeholder="Last Name"
            type="text"
            value={formData.lastName}
          />
          <input
            data-testid="email-address"
            name="email"
            onChange={handleChange}
            placeholder="Email Address"
            type="email"
            value={formData.email}
          />
          <input
            data-testid="phone-number"
            name="phone"
            onChange={handleChange}
            placeholder="Phone Number"
            type="text"
            value={formData.phone}
          />
          <textarea
            data-testid="message"
            name="message"
            onChange={handleChange}
            placeholder="Message"
            value={formData.message}
          ></textarea>
          <input
            data-testid="csrf-token"
            name="csrfToken"
            type="hidden"
            value={csrfToken}
          />
          {error && errorContent}
          <button type="submit">Submit</button>
        </form>
      </>
    )
  }

  return content;
}

export default App
