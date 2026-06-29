# ShiftPlan — מערכת ניהול משמרות

מערכת Full Stack לניהול סידור משמרות, עובדים ואילוצים.

## טכנולוגיות
- Client: HTML, CSS, JavaScript
- Server: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT
- External API: Nager.Date Public Holidays API
- JS Library: FullCalendar CDN לתצוגת לוח שנה

## הרצה מקומית
```bash
cd server
npm install
cp .env.example .env
npm run seed
npm run dev
```

לאחר מכן פותחים:
`http://localhost:5000`

## משתמשים לבדיקה
מנהל:
- email: manager@shiftplan.com
- password: 123456

עובד:
- email: employee@shiftplan.com
- password: 123456

## קישורים להגשה
- Live Website: https://shiftplan-server.onrender.com/index.html
- Client GitHub: להוסיף
- Server GitHub: https://lhamomar7.github.io/lhamomar7-WEP-PROJECT--LAST/
- Figma: https://www.figma.com/proto/Jgq7FHR7gOpTqFNVoywkAj/ShiftPlan-Mockup?node-id=0-1&t=VCYZpBU5uP9iKpl1-1
- Postman Collection: `postman/ShiftPlan.postman_collection.json`

## הערות לבודקים
המערכת כוללת CRUD מלא למשמרות, ניהול משתמשים, בקשות אילוצים, שאילתות חיפוש/סינון/סטטיסטיקה וקריאה ל־API חיצוני להצגת חגים בישראל.
