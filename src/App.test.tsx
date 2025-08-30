import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import App from './App';

const server = setupServer(
  http.get('/contact', () => {
    return HttpResponse.json({ token: 'randomToken' });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App', () => {
  it('retrieves CSRF token upon loading', async () => {
    render(<App url="/contact" />);

    await waitFor(() => {
      expect(screen.getByTestId('csrf_token')).toHaveValue('randomToken');
    });
  });
});
