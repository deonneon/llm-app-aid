# LLM App Aid

![Screenshot 2024-03-09 at 4 47 21 PM](https://github.com/deonneon/llm-code-fixer/assets/13922212/6f8a922f-fa09-437b-98dd-bb248f2894d2)

## Overview

LLM App Aid is a web application designed to streamline the process of managing and navigating through the file structure of a project. It enables users to view, select, and fetch content from files within a specified directory dynamically. The application is built with React, Next.js, and leverages Tailwind CSS for styling.

This app includes functionality to:

- Dynamically load and display the file tree of a project.
- Fetch file content from the server using Next.js API routes.
- Allow users to select specific files to concatenate their contents for display.
- Enable adding custom text to the concatenated content.
- Copy the concatenated content to the clipboard.

The app architecture is organized as follows:

- `app/` directory contains global styles, layout, and page components.
- `components/` directory houses the `FileTree.js` component responsible for rendering the file tree and managing state.
- `pages/api` directory includes Next.js API routes for fetching file and directory contents.
- `public/` serves static files like images or icons.

## Installation

### Clone the repository:

```bash
git clone <repository-url>
```

### Navigate to the project directory:

```bash
cd llm-app-aid
```

### Install dependencies:

```bash
npm install
```

or

```bash
yarn install
```

### Run the development server:

```bash
npm run dev
```

or

```bash
yarn dev
```

This will start the Next.js development server, making the app available at http://localhost:3000.

## Usage

Upon running the development server, navigate to http://localhost:3000 in your web browser. Use the interface to load your project directory, select files, and fetch their contents. You can also add custom text to be included with the concatenated file contents.

## Collaboration

To collaborate on this project:

1. Fork the repository: Click the 'Fork' button on the repository's page to create your own copy.
2. Clone your fork: Clone the forked repository to your local machine.
3. Create a new branch: Before making changes, create a new branch for your work.

   ```bash
   git checkout -b <your-branch-name>
   ```

4. Make your changes: Implement your features or fixes.
5. Commit your changes: Stage and commit your changes.

   ```bash
   git commit -am "Add a meaningful commit message"
   ```

6. Push to your fork: Push your changes to your forked repository.

   ```bash
   git push origin <your-branch-name>
   ```

7. Open a Pull Request (PR): On GitHub, navigate to the original repository you forked and open a pull request from your branch to the main project.

When contributing to the project, please follow the existing coding style and conventions. Ensure your code is well-documented and include comments explaining your logic where necessary.
