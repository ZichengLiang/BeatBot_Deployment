# Flask-React Project

A web application with Flask backend and React frontend.

## Setup Instructions

## Docker Setup (Recommended)
1. Install Docker and Docker Compose on your system
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Add your OpenAI API key to `.env`
4. Build and run the containers:
   ```bash
   docker-compose build
   docker-compose up
   ```
The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## Vercel Deployment

### Important Note on Size Limitations
Vercel has a 250MB size limit for serverless functions when unzipped. The Python backend for this project exceeds this limit due to its many dependencies.

### Recommended Deployment Strategy
For production deployment, we recommend:

1. Deploy only the frontend on Vercel (current configuration)
2. Deploy the backend separately on a platform that supports larger deployments:
   - Render
   - Heroku
   - Railway
   - A VPS provider like DigitalOcean or AWS EC2

Once you've deployed the backend, set the API_URL environment variable in your Vercel project to point to your backend URL.

### Frontend-Only Deployment Steps
1. Make sure you have the Vercel CLI installed:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel if you haven't already:
   ```bash
   vercel login
   ```

3. Set up your environment variables in the Vercel dashboard:
   - API_URL - URL of your separately deployed backend

4. Deploy the frontend:
   ```bash
   vercel --prod
   ```

### Backend Deployment Options

#### Render
1. Sign up for a Render account
2. Create a new Web Service
3. Connect your repository
4. Set the build command: `cd backend && pip install -r requirements.txt`
5. Set the start command: `cd backend && python app.py`
6. Add your environment variables (OPENAI_API_KEY, etc.)

#### Heroku
1. Install the Heroku CLI
2. Create a Procfile in your backend directory with: `web: gunicorn app:app`
3. Add gunicorn to your requirements.txt
4. Deploy with:
   ```bash
   heroku create
   git push heroku main
   heroku config:set OPENAI_API_KEY=your_key
   ```

### Troubleshooting Deployment

#### ESLint Warnings
The build process is configured to ignore ESLint warnings by setting `CI=false` in the build command. This prevents warnings about unused variables and other issues from causing the build to fail.

If you want to fix these warnings instead of ignoring them:
- Fix unused variables in MidiRenderer.js and NotationSection.js
- Add missing dependencies to React hook dependency arrays
- Fix import styles in api.js

#### Environment Variables
If you see an error about missing environment variables, make sure to add them directly in the Vercel dashboard:
1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add the required variables (like OPENAI_API_KEY)

#### Python Environment
If you encounter an "externally-managed-environment" error, our scripts will handle this by creating a Python virtual environment for the build process. The `build-local.sh` script creates this environment locally before deploying.

### Project Structure for Vercel
For Vercel deployment, the project follows this structure:
- `/api` - Contains serverless functions (index.py)
- `/frontend` - React frontend code
- `/backend` - Flask backend code
- `vercel.json` - Main configuration for Vercel deployment

Note: The serverless function in `/api/index.py` imports the Flask app from the backend directory.

### Environment Setup
Create a `.env` file based on `.env.example`:
```bash
# Required for backend
FLASK_APP=app.py
FLASK_ENV=development
OPENAI_API_KEY=your_api_key_here  # Get this from https://platform.openai.com/api-keys

# Frontend environment variables (if needed)
REACT_APP_API_URL=https://api.sweng25-ai-music-composition.com/
```

IMPORTANT: NEVER commit your actual `.env` file to version control!

## Manual Setup Instructions
If you prefer not to use Docker, follow these manual setup steps:

### API Setup
1. Go to Backend directory and set up a .env file
2. Set flask app and env, write these into the file
   ```.env
   FLASK_APP=app.py
   FLASK_ENV=development
   ```
3. Acquire an OpenAI API key at https://platform.openai.com/api-keys
4. Write your api key into the .env file like this
   ```
   OPENAI_API_KEY=(your API key)
   ```
   (Don't worry about the price, we're using gpt-4o-mini whose pricing is $0.15 per 1 million token, you're probably not going to be charged anything)

### Backend Setup
(Assuming you're currently at the root directory)
1. Create a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  
   # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask server:
You have two options: 
   ```bash
   python app.py
   ```
   or
   ```bash
   flask run --port 5001
   ```

### Frontend Setup
(Assuming you're currently at the root directory)
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000` and the backend will run on `http://localhost:5001`.



# SwEng25_Group10_IBMMusicAI



## Getting started

To make it easy for you to get started with GitLab, here's a list of recommended next steps.

Already a pro? Just edit this README.md and make it your own. Want to make it easy? [Use the template at the bottom](#editing-this-readme)!

## Add your files

- [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://docs.gitlab.com/ee/gitlab-basics/add-file.html#add-a-file-using-the-command-line) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin https://gitlab.scss.tcd.ie/csu_sweng25_grp10/sweng25_group10_ibmmusicai.git
git branch -M main
git push -uf origin main
```

## Integrate with your tools

- [ ] [Set up project integrations](https://gitlab.scss.tcd.ie/csu_sweng25_grp10/sweng25_group10_ibmmusicai/-/settings/integrations)

## Collaborate with your team

- [ ] [Invite team members and collaborators](https://docs.gitlab.com/ee/user/project/members/)
- [ ] [Create a new merge request](https://docs.gitlab.com/ee/user/project/merge_requests/creating_merge_requests.html)
- [ ] [Automatically close issues from merge requests](https://docs.gitlab.com/ee/user/project/issues/managing_issues.html#closing-issues-automatically)
- [ ] [Enable merge request approvals](https://docs.gitlab.com/ee/user/project/merge_requests/approvals/)
- [ ] [Set auto-merge](https://docs.gitlab.com/ee/user/project/merge_requests/merge_when_pipeline_succeeds.html)

## Test and Deploy

Use the built-in continuous integration in GitLab.

- [ ] [Get started with GitLab CI/CD](https://docs.gitlab.com/ee/ci/quick_start/index.html)
- [ ] [Analyze your code for known vulnerabilities with Static Application Security Testing (SAST)](https://docs.gitlab.com/ee/user/application_security/sast/)
- [ ] [Deploy to Kubernetes, Amazon EC2, or Amazon ECS using Auto Deploy](https://docs.gitlab.com/ee/topics/autodevops/requirements.html)
- [ ] [Use pull-based deployments for improved Kubernetes management](https://docs.gitlab.com/ee/user/clusters/agent/)
- [ ] [Set up protected environments](https://docs.gitlab.com/ee/ci/environments/protected_environments.html)

***

# Editing this README

When you're ready to make this README your own, just edit this file and use the handy template below (or feel free to structure it however you want - this is just a starting point!). Thanks to [makeareadme.com](https://www.makeareadme.com/) for this template.

## Suggestions for a good README

Every project is different, so consider which of these sections apply to yours. The sections used in the template are suggestions for most open source projects. Also keep in mind that while a README can be too long and detailed, too long is better than too short. If you think your README is too long, consider utilizing another form of documentation rather than cutting out information.

## Name
Choose a self-explaining name for your project.

## Description
Let people know what your project can do specifically. Provide context and add a link to any reference visitors might be unfamiliar with. A list of Features or a Background subsection can also be added here. If there are alternatives to your project, this is a good place to list differentiating factors.

## Badges
On some READMEs, you may see small images that convey metadata, such as whether or not all the tests are passing for the project. You can use Shields to add some to your README. Many services also have instructions for adding a badge.

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation
Within a particular ecosystem, there may be a common way of installing things, such as using Yarn, NuGet, or Homebrew. However, consider the possibility that whoever is reading your README is a novice and would like more guidance. Listing specific steps helps remove ambiguity and gets people to using your project as quickly as possible. If it only runs in a specific context like a particular programming language version or operating system or has dependencies that have to be installed manually, also add a Requirements subsection.

## Usage
Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## Support
Tell people where they can go to for help. It can be any combination of an issue tracker, a chat room, an email address, etc.

## Roadmap
If you have ideas for releases in the future, it is a good idea to list them in the README.

## Contributing
State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

## Authors and acknowledgment
| Name | StudentID | Course&Year |
|------|-----------|-------------|
| Zicheng Liang | 23331250 | ICS Year2|

Show your appreciation to those who have contributed to the project.

## License
For open source projects, say how it is licensed.

## Project status
If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.
