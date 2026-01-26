/**
 * Unit tests for LogoUploadModal component
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';

import LogoUploadModal from '../LogoUploadModal';

// Mock the hooks and dependencies
jest.mock('@src/hooks/useUploadArNSLogo', () => ({
  useUploadArNSLogo: jest.fn(() => ({
    uploadLogo: jest.fn(),
  })),
}));

jest.mock('@src/state', () => ({
  useWalletState: jest.fn(() => [
    {
      wallet: {
        address: 'test-address',
        turboSigner: {},
      },
    },
  ]),
}));

jest.mock('@src/utils/events', () => ({
  __esModule: true,
  default: {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  },
}));

describe('LogoUploadModal', () => {
  afterEach(cleanup);

  const mockOnClose = jest.fn();
  const mockOnUpdateSuccess = jest.fn();

  it('should not render when show is false', () => {
    const { container } = render(
      <Router>
        <LogoUploadModal
          show={false}
          onClose={mockOnClose}
          onUpdateSuccess={mockOnUpdateSuccess}
        />
      </Router>,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when show is true', () => {
    render(
      <Router>
        <LogoUploadModal
          show={true}
          onClose={mockOnClose}
          onUpdateSuccess={mockOnUpdateSuccess}
        />
      </Router>,
    );

    expect(screen.getByText('Update Logo')).toBeInTheDocument();
  });

  it('should render drag and drop zone', () => {
    render(
      <Router>
        <LogoUploadModal
          show={true}
          onClose={mockOnClose}
          onUpdateSuccess={mockOnUpdateSuccess}
        />
      </Router>,
    );

    expect(
      screen.getByText(/Drop image here or click to browse/i),
    ).toBeInTheDocument();
  });

  it('should display supported file types', () => {
    render(
      <Router>
        <LogoUploadModal
          show={true}
          onClose={mockOnClose}
          onUpdateSuccess={mockOnUpdateSuccess}
        />
      </Router>,
    );

    expect(
      screen.getByText(/Supported: PNG, JPEG, GIF, SVG, WebP/i),
    ).toBeInTheDocument();
  });

  it('should display max file size information', () => {
    render(
      <Router>
        <LogoUploadModal
          show={true}
          onClose={mockOnClose}
          onUpdateSuccess={mockOnUpdateSuccess}
        />
      </Router>,
    );

    expect(screen.getByText(/Max size: 100 KiB/i)).toBeInTheDocument();
  });

  it('should render file input with accessibility label', () => {
    render(
      <Router>
        <LogoUploadModal
          show={true}
          onClose={mockOnClose}
          onUpdateSuccess={mockOnUpdateSuccess}
        />
      </Router>,
    );

    const fileInput = screen.getByLabelText('Upload logo image file');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
  });

  it('should render Cancel button', () => {
    render(
      <Router>
        <LogoUploadModal
          show={true}
          onClose={mockOnClose}
          onUpdateSuccess={mockOnUpdateSuccess}
        />
      </Router>,
    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should render Upload button (initially disabled)', () => {
    render(
      <Router>
        <LogoUploadModal
          show={true}
          onClose={mockOnClose}
          onUpdateSuccess={mockOnUpdateSuccess}
        />
      </Router>,
    );

    const uploadButton = screen.getByText('Upload');
    expect(uploadButton).toBeInTheDocument();
    expect(uploadButton).toBeDisabled();
  });
});
