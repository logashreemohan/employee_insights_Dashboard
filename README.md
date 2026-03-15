#  Employee Insights Dashboard

A modern **React-based Employee Insights Dashboard** designed to manage and verify employee records with **photo capture and digital signature validation**.

This project demonstrates **frontend engineering skills**, including real-time camera access, canvas processing, virtualized tables, and responsive UI development.

---

##  Key Features

### Authentication

* Simple login system for demo usage
* Secure routing using React Router

### Employee Management

* Employee list displayed in a **high-performance virtual scrolling table**
* Mock dataset representing **Indian salary structures**
* Fast rendering even with large datasets

###  Camera Integration

* Capture employee photos directly from the device camera
* Uses browser **MediaDevices API**

###  Digital Signature Capture

* Draw signatures using a **retina-optimized canvas**
* Smooth signature rendering for high-resolution displays

### Image Processing

* Merge captured photo and signature
* Generate a **PNG image blob**
* Preview final verification image

###  Result View

* Display merged employee verification image
* Clean UI for validation and demonstration

---

## Application Flow

1️⃣ Login to the dashboard
2️⃣ View employee list (mock data)
3️⃣ Select an employee profile
4️⃣ Capture employee photo using camera
5️⃣ Add digital signature
6️⃣ Merge photo + signature
7️⃣ View final verification result image

---

##  Tech Stack

**Frontend**

* React
* Vite
* React Router
* Tailwind CSS

**Browser APIs**

* MediaDevices API (Camera access)
* HTML5 Canvas API
* Blob Image Processing

---

##  Installation & Setup

Clone the repository:

```bash
git clone https://github.com/logashreemohan/employee_insights_Dashboard.git
```

Navigate to the project directory:

```bash
cd employee_insights_Dashboard
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

---

##  Demo Login

```
Username: testuser
Password: Test123
```

---

## mportant Notes

* Camera access requires **browser permission**
* HTTPS is recommended for full camera support
* Works best on **Chrome and Firefox**
* API integration is currently **mocked due to backend downtime**

---

##  Engineering Highlights

✔ Virtualized employee table for performance
✔ Real-time camera capture
✔ Canvas-based signature rendering
✔ Image merging and blob generation
✔ Retina display scaling fix
✔ Clean modular React components

---

##  Future Improvements

* Backend API integration
* Employee database
* Role-based authentication
* Image storage (AWS S3 / Cloudinary)
* Admin analytics dashboard
* Export verification records

---

##  Author

**Logashree M**
Built as a frontend engineering demo project.

---

