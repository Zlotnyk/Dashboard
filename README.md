# 🎯 DOOIT - Student Planner & Lifestyle Dashboard

<div align="center">

![DOOIT Logo](https://img.shields.io/badge/DOOIT-Student%20Planner-97e7aa?style=for-the-badge&logo=react)

**A comprehensive productivity platform designed for students and lifestyle management**

[![React](https://img.shields.io/badge/React-18.2.0-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.6-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[✨ Features](#-features) • [🚀 Quick Start](#-quick-start) • [📱 Pages](#-pages) • [🛠️ Tech Stack](#️-tech-stack) • [🎨 Customization](#-customization)

</div>

---

## 📖 About

**DOOIT** is a modern, feature-rich student planner and lifestyle management platform built with React and Tailwind CSS. It combines academic planning tools with lifestyle management features to help students organize their lives effectively.

### 🌟 Key Highlights

- **📚 Academic Focus**: Comprehensive tools for student life management
- **🎨 Beautiful UI**: Modern dark theme with customizable accent colors
- **📱 Responsive Design**: Works seamlessly across all devices
- **⚡ Fast Performance**: Built with Vite for lightning-fast development
- **🔧 Modular Architecture**: Clean, maintainable codebase

---

## ✨ Features

### 🎓 **Student Planner** (Main Dashboard)
- **📝 To-Do Lists**: Smart task management with priority levels
- **📅 Calendar Integration**: Big calendar with event management
- **⏰ Flip Clock**: Elegant time display with day indicator
- **📊 Task Timeline**: Visual project timeline with drag-and-drop
- **📋 Exam Reminders**: Track upcoming exams and assignments
- **📓 Daily Notes**: Quick note-taking functionality

### 🌸 **Lifestyle Management**
- **✈️ Trip Planner**: Plan and organize your travels with photo uploads
- **🎂 Birthday Tracker**: Never miss important birthdays with smart filtering
- **🎉 Event Planning**: Manage upcoming events with detailed information
- **📋 Today's Tasks**: Focus on daily priorities
- **🔗 Quick Links**: Fast access to lifestyle tools

### 🎨 **Customization**
- **6 Theme Colors**: Green, Purple, Blue, Red, Orange, Pink
- **🌈 Dynamic Backgrounds**: Animated GIF backgrounds for each theme
- **⚙️ Settings Panel**: Easy theme switching and preferences
- **🌙 Dark Mode**: Optimized for comfortable viewing

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dooit-student-planner.git
   cd dooit-student-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📱 Pages

| Page | Status | Description |
|------|--------|-------------|
| **🏠 Student Planner** | ✅ **Active** | Main dashboard with academic tools |
| **🌸 Lifestyle** | ✅ **Active** | Lifestyle management and planning |
| **💪 Health & Fitness** | 🚧 **In Development** | Workout and nutrition tracking |
| **🧘 Wellness** | 🚧 **In Development** | Mental health and mindfulness |
| **⚡ Productivity** | 🚧 **In Development** | Time tracking and analytics |
| **💰 Finance** | 🚧 **In Development** | Budget and expense management |

---

## 🛠️ Tech Stack

### **Frontend**
- **⚛️ React 18.2.0** - Modern UI library
- **⚡ Vite 6.3.5** - Next-generation build tool
- **🎨 Tailwind CSS 4.1.6** - Utility-first CSS framework
- **🧭 React Router DOM** - Client-side routing

### **UI Components**
- **🎭 Headless UI** - Unstyled, accessible components
- **🎯 Lucide React** - Beautiful icon library
- **📅 Date-fns** - Modern date utility library

### **Development Tools**
- **📏 ESLint** - Code linting and formatting
- **🔧 Vite Plugins** - Enhanced development experience

---

## 🎨 Customization

### Theme Colors

DOOIT comes with 6 beautiful theme options:

| Color | Hex Code | Preview |
|-------|----------|---------|
| 🟢 **Green** | `#97e7aa` | ![Green](https://img.shields.io/badge/●-97e7aa?style=flat-square) |
| 🟣 **Purple** | `#a855f7` | ![Purple](https://img.shields.io/badge/●-a855f7?style=flat-square) |
| 🔵 **Blue** | `#3b82f6` | ![Blue](https://img.shields.io/badge/●-3b82f6?style=flat-square) |
| 🔴 **Red** | `#ef4444` | ![Red](https://img.shields.io/badge/●-ef4444?style=flat-square) |
| 🟠 **Orange** | `#f97316` | ![Orange](https://img.shields.io/badge/●-f97316?style=flat-square) |
| 🩷 **Pink** | `#ec4899` | ![Pink](https://img.shields.io/badge/●-ec4899?style=flat-square) |

### Changing Themes

1. Click the **⚙️ Settings** icon in the navbar
2. Select your preferred color from the **Accent Color & Background** section
3. Changes apply instantly across the entire application

---

## 📁 Project Structure

```
src/
├── 📁 components/           # Reusable UI components
│   ├── 📁 FlipClock/       # Animated flip clock component
│   ├── 📁 Task_Timeline/   # Task timeline with drag-and-drop
│   ├── 📄 big-calendar.jsx # Main calendar component
│   ├── 📄 navbar.jsx      # Navigation and settings
│   └── 📄 ...             # Other components
├── 📁 pages/               # Page components
│   ├── 📄 lifestyle.jsx   # Lifestyle management page
│   ├── 📄 health-fitness.jsx # Health & fitness (dev)
│   └── 📄 ...             # Other pages
├── 📁 assets/              # Static assets
│   └── 📁 img/            # Theme background GIFs
├── 📄 App.jsx             # Main application component
├── 📄 App.css             # Global styles and animations
└── 📄 main.jsx            # Application entry point
```

---

## 🔧 Key Components

### **🕐 Flip Clock**
- Real-time animated flip clock
- Day of the week display
- Smooth CSS animations

### **📊 Task Timeline**
- Drag-and-drop task management
- Month/Week view switching
- Visual progress tracking

### **📅 Calendar System**
- Full calendar with event management
- Birthday tracking with age calculation
- Category-based event organization

### **🎨 Theme System**
- CSS custom properties for dynamic theming
- Automatic background switching
- Persistent theme preferences

---

## 🚀 Performance Features

- **⚡ Fast Startup**: Vite's instant server start
- **🔄 Hot Module Replacement**: Real-time updates during development
- **📦 Optimized Builds**: Tree-shaking and code splitting
- **💾 Local Storage**: Persistent user preferences and data

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **🍴 Fork** the repository
2. **🌿 Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **💾 Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **📤 Push** to the branch (`git push origin feature/amazing-feature`)
5. **🔄 Open** a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first approach
- **Lucide** for the beautiful icons
- **Headless UI** for accessible components

---

## 📞 Support

If you have any questions or need help:

- 📧 **Email**: support@dooit.app
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/dooit-student-planner/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/dooit-student-planner/discussions)

---

<div align="center">

**Made with ❤️ for students everywhere**

⭐ **Star this repo if you find it helpful!** ⭐

</div>