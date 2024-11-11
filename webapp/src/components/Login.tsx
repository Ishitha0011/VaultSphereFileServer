import React from 'react';
import {
  Grommet,
  Button,
  Box,
  Notification,
  Form,
  FormField,
  TextInput,
  Heading,
} from 'grommet';
import { deepMerge } from 'grommet/utils';

const customTheme = deepMerge({
  global: {
    colors: {
      brand: '#1E3A5F', // Navy blue for header
      background: '#ffffff', // White background for login box
      focus: '#4C91B9', // Light blue for focus elements
      text: '#333333', // Dark text for contrast
      accent: '#4C91B9', // Light blue for accents
      'button-text': '#ffffff', // White text color for button
    },
    font: {
      family: 'Roboto',
      size: '16px',
      height: '20px',
    },
  },
  button: {
    primary: {
      color: 'button-text',
    },
    border: {
      radius: '8px',
    },
    padding: {
      vertical: '8px',
      horizontal: '16px',
    },
  },
});

export const Login = ({ setAuthenticated }) => {
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = ({ value }: { value: { password: string } }) => {
    if (value.password === 'password') {
      localStorage.setItem('user-authenticated', 'true');
      setAuthenticated(true);
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <Grommet theme={customTheme} full>
      <Box
        fill
        align="center"
        justify="center"
        background={{ color: 'light-1' }}
        overflow="hidden" // Disable overflow here
        style={{ overflow: 'hidden' }} // Additional inline style for extra assurance
      >
        <Box
          pad="large"
          width="medium"
          background="background"
          round="small"
          elevation="small"
          align="center"
          gap="small"
          style={{ borderRadius: '12px', padding: '40px' }}
        >
          <Heading level="2" margin="none" color="brand">
            VaultSphere
          </Heading>
          <Box margin={{ top: 'small', bottom: 'medium' }} color="text">
            Please log in to continue
          </Box>

          {/* Error Message Notification */}
          {error && (
            <Notification
              status="critical"
              title="Login Failed"
              message={error}
              onClose={() => setError(null)}
              margin={{ bottom: 'small' }}
            />
          )}

          <Form onSubmit={handleSubmit}>
            <FormField
              label="Password"
              name="password"
              htmlFor="password"
              contentProps={{ width: '100%' }}
              margin={{ bottom: 'medium' }}
            >
              <TextInput
                type="password"
                name="password"
                id="password"
                placeholder="Enter your password"
                size="medium"
              />
            </FormField>

            <Button
              label="Log In"
              type="submit"
              primary
              fill="horizontal"
              margin={{ top: 'small' }}
              size="medium"
            />
          </Form>
        </Box>
      </Box>
    </Grommet>
  );
};
