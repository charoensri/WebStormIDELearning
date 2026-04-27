import { Layout } from '../components/Layout'

interface ErrorPageProps {
  status: number;
  message: string;
}

export function ErrorPage({ status, message }: ErrorPageProps) {
  return (
    <Layout title={`${status} Error`}>
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem 2rem', 
        backgroundColor: 'white', 
        borderRadius: '0.75rem', 
        boxShadow: 'var(--shadow-sm)',
        marginTop: '2rem'
      }}>
        <h1 style={{ fontSize: '4rem', margin: '0', color: 'var(--color-primary)' }}>{status}</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Oops! {message}</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          It seems like an AI agent might have tripped over a cable. 
          Don't worry, we're on it.
        </p>
        <a href="/" style={{ 
          display: 'inline-block',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          fontWeight: '600'
        }}>
          Return to Dashboard
        </a>
      </div>
    </Layout>
  )
}
