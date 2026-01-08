# Contributing to EMS Supply Tracker

Thank you for your interest in contributing to the EMS Supply Tracker! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful and professional. We aim to create an inclusive environment for all contributors.

## Getting Started

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/your-username/swazzers.git
cd swazzers
```

3. Add upstream remote:
```bash
git remote add upstream https://github.com/morgang213/swazzers.git
```

4. Create a branch:
```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

### 1. Setup Development Environment

Follow the instructions in the main README.md to set up your development environment using Docker or local installation.

### 2. Make Changes

- Write clean, readable code
- Follow existing code style and conventions
- Add comments for complex logic
- Update documentation as needed

### 3. Testing

Before submitting:
- Test your changes thoroughly
- Ensure all existing functionality still works
- Test on different screen sizes (mobile responsiveness)
- Verify database migrations work correctly

### 4. Commit Your Changes

Use clear, descriptive commit messages:
```bash
git add .
git commit -m "feat: add inventory export feature"
```

Commit message format:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style Guidelines

### Backend (Node.js/Express)

- Use ES6+ features
- Use async/await for asynchronous operations
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Follow existing patterns for database queries
- Always filter by agency_id for multi-tenant isolation

Example:
```javascript
/**
 * Get user by ID
 * @param {number} userId - User ID
 * @param {number} agencyId - Agency ID
 * @returns {Promise<Object>} User object
 */
async function getUserById(userId, agencyId) {
  const user = await db('users')
    .where({ id: userId, agency_id: agencyId })
    .first();
  return user;
}
```

### Frontend (React/Next.js)

- Use functional components and hooks
- Use meaningful component and variable names
- Keep components focused and reusable
- Use Tailwind CSS for styling
- Ensure minimum 44px touch targets for mobile
- Handle loading and error states

Example:
```jsx
export default function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await apiClient.getData();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return <div>{/* component JSX */}</div>;
}
```

### Database

- Always use migrations for schema changes
- Never modify existing migrations
- Create new migrations for changes
- Use descriptive migration names
- Include both up and down methods

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Changes tested locally
- [ ] No console errors
- [ ] Mobile responsiveness verified

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- Describe testing performed
- List any new dependencies

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Tested thoroughly
- [ ] Documentation updated
```

## Feature Requests

Have an idea? Create an issue with:
- Clear description of the feature
- Use case/benefit
- Potential implementation approach

## Bug Reports

Found a bug? Create an issue with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment (browser, OS, etc.)

## Areas for Contribution

### High Priority
- Email notifications (SendGrid integration)
- Advanced reporting features
- Mobile app (React Native)
- Bulk import/export features
- Advanced search and filters

### Medium Priority
- User preferences and settings
- Dashboard customization
- Additional charts and visualizations
- Automated testing
- Performance optimizations

### Low Priority
- Dark mode
- Internationalization
- Additional integrations
- Advanced analytics

## Questions?

Feel free to:
- Open an issue for discussion
- Email: support@ems-tracker.com
- Check existing issues and PRs

## License

By contributing, you agree that your contributions will be licensed under the ISC License.
