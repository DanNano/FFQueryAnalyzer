# FFQueryAnalyzer

Follow these steps to get the application up and running on your local machine.

## Getting Started

These instructions will guide you through setting up the project locally.

### Prerequisites

- Ensure you have Node.js installed on your machine.
- Connect to the Gatorlink VPN using AnyConnect.

### Installation

1. **Clone the Project**

   Clone the project repository to your local machine:

   git clone https://github.com/DanNano/FFQueryAnalyzer.git

2. **Navigate to the App Directory**

   Change into the project's `app` directory:

   cd FFQueryAnalyzer/app
   
4. **Set USERNAME and PASSWORD**

   In FFQueryAnalyzer/app create a file, .env, with your gatorlink username and your oracle password in the following format
   
   DB_USER=yourusername

   DB_PASSWORD=yourpassword
   
6. **Install Dependencies**

   Install the necessary dependencies by running:

   npm install
   npm install react-chartjs-2 chart.js

8. **Start the Application**

   Start the application with:

   npm run dev

   This will launch the app and automatically open it in your default web browser. If it doesn't open automatically, you can manually navigate to http://localhost:3000 in your browser.

