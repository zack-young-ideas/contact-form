import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import App from './App';
import { headerCsrfResponse, bodyCsrfResponse } from './mockServer';

const server = setupServer(
  headerCsrfResponse.get,
  headerCsrfResponse.post,
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App', () => {
  it('retrieves CSRF token upon loading', async () => {
    render(<App url="/contact" csrfHeaderName="X-CSRF-Token" />);

    await waitFor(() => {
      expect(screen.getByTestId('csrf-token')).toHaveValue('randomToken');
    });
  });

  it('can retrieve CSRF token from response body', async () => {
    server.use(bodyCsrfResponse.get);

    render(<App url="/contact" csrfFieldName="token" />);

    await waitFor(() => {
      expect(screen.getByTestId('csrf-token')).toHaveValue('randomToken');
    });
  });

  it('displays error message if CSRF token fails', async () => {
    server.use(
      http.get('/contact', () => {
        return HttpResponse.json(null, { status: 500 });
      }),
    );

    render(<App url="/contact" csrfHeaderName="X-CSRF-Token" />);

    await waitFor(() => {
      expect(screen.getByTestId('error-message'))
        .toHaveTextContent('Unable to load contact form');
    });
  });

  it('times out if CSRF token is unavailable', async () => {
    render(<App url="/unavailable" csrfHeaderName="X-CSRF-Token" />);

    await waitFor(() => {
      expect(screen.getByTestId('error-message'))
        .toHaveTextContent('Unable to load contact form');
    });
  });

  it('uses header if csrfHeaderName and csrfFieldName are set', async () => {
    render(<App
      url="/contact"
      csrfHeaderName="X-CSRF-Token"
      csrfFieldName="token"
    />);

  });

  it('submits form data', async () => {
    render(<App url="/contact" csrfHeaderName="X-CSRF-Token" />);

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

  it('displays error message if POST request fails', async () => {
    server.use(
      http.post('/contact', () => {
        return HttpResponse.json({
          message: 'Invalid email address'
        }, {
          status: 500
        });
      }),
    );

    render(<App url="/contact" csrfHeaderName="X-CSRF-Token" />);

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
      expect(screen.getByTestId('error-message'))
        .toHaveTextContent('Invalid email address');
    });
  });
});
