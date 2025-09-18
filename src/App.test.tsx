import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import App from './App';
import { headerCsrfResponse, bodyCsrfResponse } from './mockServer';

const server = setupServer(
  headerCsrfResponse.get('X-CSRF-Token'),
  headerCsrfResponse.post('X-CSRF-Token'),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App', () => {
  it('retrieves CSRF token upon loading', async () => {
    render(<App
      csrfUrl="/csrf"
      submitUrl="/contact"
      csrfHeaderName="X-CSRF-Token"
    />);

    await waitFor(() => {
      expect(screen.getByTestId('first-name')).toBeInTheDocument();
    });
  });

  it('can retrieve CSRF token from response body', async () => {
    server.use(bodyCsrfResponse.get('token'));

    render(<App
      csrfUrl="/csrf"
      submitUrl="/contact"
      csrfFieldName="token"
    />);

    await waitFor(() => {
      expect(screen.getByTestId('first-name')).toBeInTheDocument();
    });
  });

  it('displays error message if CSRF token fails', async () => {
    server.use(
      http.get('/csrf', () => {
        return HttpResponse.json(null, { status: 500 });
      }),
    );

    render(<App
      csrfUrl="/csrf"
      submitUrl="/contact"
      csrfHeaderName="X-CSRF-Token"
    />);

    await waitFor(() => {
      expect(screen.getByTestId('error-message'))
        .toHaveTextContent('Unable to load contact form');
    });
  });

  it('displays error message if CSRF token is unavailable', async () => {
    render(<App
      csrfUrl="/unavailable"
      submitUrl="/contact"
      csrfHeaderName="X-CSRF-Token"
    />);

    await waitFor(() => {
      expect(screen.getByTestId('error-message'))
        .toHaveTextContent('Unable to load contact form');
    });
  });

  it('displays error message if CSRF token times out', async () => {
    server.use(
      http.get('/csrf', async () => {
        await delay(9000);
        return HttpResponse.json(null, { status: 200 });
      }),
    );

    render(<App
      csrfUrl="/csrf"
      submitUrl="/contact"
      csrfHeaderName="X-CSRF-Token"
    />);

    await waitFor(() => {
      expect(screen.getByTestId('error-message'))
        .toHaveTextContent('Unable to load contact form');
    }, { timeout: 9000, interval: 100 });
  }, 9000);

  it('uses header if csrfHeaderName and csrfFieldName are set', async () => {
    render(<App
      csrfUrl="/csrf"
      submitUrl="/contact"
      csrfHeaderName="X-CSRF-Token"
      csrfFieldName="token"
    />);

    await waitFor(() => {
      expect(screen.queryByTestId('csrf-token')).not.toBeInTheDocument();
    });
  });

  it('throws error if neither header or field name specified', () => {
    expect(() => render(<App csrfUrl="/csrf" submitUrl="/contact" />))
      .toThrow('Must provide a value for either csrfHeaderName or ');
  });

  it('throws error if csrfUrl is not specified', () => {
    expect(() => render(<App
      submitUrl="/contact"
      csrfHeaderName="X-CSRF-Token"
    />))
      .toThrow('Must provide a value for csrfUrl');
  });

  it('throws error if submitUrl is not specified', () => {
    expect(() => render(<App
      csrfUrl="/csrf"
      csrfHeaderName="X-CSRF-Token"
    />))
      .toThrow('Must provide a value for submitUrl');
  });

  it('submits form data', async () => {
    render(<App
      csrfUrl="/csrf"
      submitUrl="/contact"
      csrfHeaderName="X-CSRF-Token"
    />);

    await waitFor(() => {
      expect(screen.getByTestId('first-name')).toBeInTheDocument();
    });

    const firstNameField = await screen.getByTestId('first-name');
    const lastNameField = await screen.getByTestId('last-name');
    const emailField = await screen.getByTestId('email-address');
    const phoneField = await screen.getByTestId('phone-number');
    const messageField = await screen.getByTestId('message');
    const submitButton = await screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(firstNameField, { target: { value: 'John' } });
    fireEvent.change(lastNameField, { target: { value: 'Smith' } });
    fireEvent.change(emailField, { target: { value: 'jsmith@example.com' } });
    fireEvent.change(phoneField, { target: { value: '1234567890' } });
    fireEvent.change(
      messageField, { target: { value: 'I would love to hear from you.' } }
    );
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('success-message'))
        .toHaveTextContent('Form submitted successfully');
    });
  });

  it('displays error message if POST request fails', async () => {
    server.use(
      http.post('/contact', () => {
        return HttpResponse.json({
          message: 'Invalid email address'
        }, {
          status: 400
        });
      }),
    );

    render(<App
      csrfUrl="/csrf"
      submitUrl="/contact"
      csrfHeaderName="X-CSRF-Token"
    />);

    await waitFor(() => {
      expect(screen.getByTestId('first-name')).toBeInTheDocument();
    });

    const firstNameField = await screen.getByTestId('first-name');
    const lastNameField = await screen.getByTestId('last-name');
    const emailField = await screen.getByTestId('email-address');
    const phoneField = await screen.getByTestId('phone-number');
    const messageField = await screen.getByTestId('message');
    const submitButton = await screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(firstNameField, { target: { value: 'John' } });
    fireEvent.change(lastNameField, { target: { value: 'Smith' } });
    fireEvent.change(emailField, { target: { value: 'jsmith@example.com' } });
    fireEvent.change(phoneField, { target: { value: '1234567890' } });
    fireEvent.change(
      messageField, { target: { value: 'I would love to hear from you.' } }
    );
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message'))
        .toHaveTextContent('Invalid email address');
    });
  });

  it('can submit CSRF token in request body', async () => {
    server.use(bodyCsrfResponse.get('token'));
    server.use(bodyCsrfResponse.post());

    render(<App
      csrfUrl="/csrf"
      submitUrl="/contact"
      csrfFieldName="token"
    />);

    await waitFor(() => {
      expect(screen.getByTestId('csrf-token')).toHaveValue('randomToken');
    });

    const firstNameField = await screen.getByTestId('first-name');
    const lastNameField = await screen.getByTestId('last-name');
    const emailField = await screen.getByTestId('email-address');
    const phoneField = await screen.getByTestId('phone-number');
    const messageField = await screen.getByTestId('message');
    const submitButton = await screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(firstNameField, { target: { value: 'John' } });
    fireEvent.change(lastNameField, { target: { value: 'Smith' } });
    fireEvent.change(emailField, { target: { value: 'jsmith@example.com' } });
    fireEvent.change(phoneField, { target: { value: '1234567890' } });
    fireEvent.change(
      messageField, { target: { value: 'I would love to hear from you.' } }
    );
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('success-message'))
        .toHaveTextContent('Form submitted successfully');
    });
  });

  it('displays error message if contact form times out', async () => {
    server.use(
      http.post('/contact', async () => {
        await delay(9000);
        return HttpResponse.json(null, { status: 200 });
      }),
    );

    render(<App
      csrfUrl="/csrf"
      submitUrl="/contact"
      csrfHeaderName="X-CSRF-Token"
    />);

    await waitFor(() => {
      expect(screen.getByTestId('first-name')).toBeInTheDocument();
    });

    const firstNameField = await screen.getByTestId('first-name');
    const lastNameField = await screen.getByTestId('last-name');
    const emailField = await screen.getByTestId('email-address');
    const phoneField = await screen.getByTestId('phone-number');
    const messageField = await screen.getByTestId('message');
    const submitButton = await screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(firstNameField, { target: { value: 'John' } });
    fireEvent.change(lastNameField, { target: { value: 'Smith' } });
    fireEvent.change(emailField, { target: { value: 'jsmith@example.com' } });
    fireEvent.change(phoneField, { target: { value: '1234567890' } });
    fireEvent.change(
      messageField, { target: { value: 'I would love to hear from you.' } }
    );
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message'))
        .toHaveTextContent('Unable to connect to server');
    }, { timeout: 9000, interval: 100 });
  }, 9000);
});
