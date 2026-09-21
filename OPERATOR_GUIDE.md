# FlourERP — Operator & Shop Handbook
## ملک حنظلہ مشتاق اینڈ سنز آٹا چکی — آپریٹر گائیڈ و دستی کتابچہ

---

## 1. System Overview (نظام کا تعارف)
**FlourERP** is an enterprise-grade ERP, POS, and Double-Entry Ledger system custom-tailored for Atta Chakki (flour mill) operations in Pakistan. It supports offline-first local SQLite transactions, dual-language (Urdu Nastaleeq & English) interfaces, low-literacy numeric touch keypad ergonomics, thermal receipt generation (58mm/80mm ESC/POS), and strict audit logging.

**فلور ای آر پی** آٹا چکی اور پسائی کے کاروبار کے لیے مخصوص کردہ خودکار اکاؤنٹنگ اور بلنگ سسٹم ہے۔ یہ سسٹم انٹرنیٹ کے بغیر (لوکل کمپیوٹر) پر تیز ترین رفتار سے چلتا ہے اور مکمل اردو و انگریزی زبان کو سپورٹ کرتا ہے۔

---

## 2. Quick Startup (ایک کلک سے سسٹم چلانا)

### Windows One-Click Launcher:
1. Double-click the file **`start-flour-erp.bat`** on your desktop or main folder.
2. The launcher will automatically verify Node.js and the SQLite database.
3. Two service windows will open in the background:
   - **FlourERP API** (Port 5000)
   - **FlourERP Web** (Port 3000)
4. Your default browser will automatically navigate to `http://localhost:3000`.

### بند کرنے کا طریقہ (Stopping the System):
دونوں اوپن شدہ کمانڈ پرامپٹ ونڈوز (`FlourERP API` اور `FlourERP Web`) کو بند (Close / X) کر دیں۔

---

## 3. User Roles & Access Matrix (صارفین کے اختیارات)

| Role (عہدہ) | Username | Default Password | PIN | Permissions (اختیارات) |
| :--- | :--- | :--- | :--- | :--- |
| **SuperAdmin (مالک)** | `hanzala` | `admin123` | `1234` | مکمل کنٹرول، ریٹ میں تبدیلی، بل منسوخی (Void)، روزانہ ڈے کلوزنگ، تمام آڈٹ لاگز |
| **Admin (منیجر)** | `arham` | `arham123` | `1234` | بلنگ، کسٹمر کھاتہ، ادھار وصولی، رپورٹیں، اخراجات |
| **Biller (کاؤنٹر اسٹاف)** | `asif` | `biller123` | `0001` | نقد بل بنانا، پسائی ٹوکن جاری کرنا، کھاتہ چیک کرنا (بل منسوخ یا ریٹ ایڈٹ نہیں کر سکتا) |

---

## 4. Counter Billing Workflows (کاؤنٹر پر بل بنانے کا طریقہ)

### A. تیار آٹا و مصنوعات کی فروخت (Product Billing)
1. **مصنوعات کا انتخاب (Select Product):**
   - اسکرین پر مطلوبہ کارڈ پر کلک یا ٹیپ کریں (چکی آٹا، فائن آٹا، میدہ اسپیشل، سوجی، وغیرہ)۔
2. **وزن یا رقم کا اندراج (Enter Weight / Amount):**
   - **وزن سے رقم (Weight to Amount):** مثلاً 10 کلو درج کریں، رقم خودکار طور پر ضرب ہو کر سامنے آ جائے گی۔
   - **رقم سے وزن (Amount to Weight):** کسٹمر کہے "مجھے 500 کا آٹا دیں"، تو 500 درج کریں، کلو گرام خودکار طور پر نکل آئے گا۔
3. **ادائیگی کی قسم (Payment Mode):**
   - **نقد (Cash):** کسٹمر سے وصول کی گئی رقم درج کریں؛ بقایا (Change) خودکار حساب ہو جائے گا۔
   - **ادھار (Credit):** صرف مجاز صارفین کے لیے؛ کسٹمر کا نام منتخب کریں۔ کسٹمر کا کھاتہ خودکار اپڈیٹ ہو جائے گا۔
4. **پرنٹ رسید (Print / Save):**
   - "بل محفوظ و پرنٹ کریں" پر کلک کریں یا کی پیڈ سے **Enter** دبائیں۔ کامیابی کی مدھر آواز (Chime) بجے گی اور تھرمل پرنٹر پر رسید نکل آئے گی۔

### B. گندم پسائی سروس (Wheat Grinding / Pisai Ticketing)
1. سروس کا انتخاب کریں:
   - **صفائی و پسائی (Cleaning & Grinding)**
   - **صرف پسائی (Grinding Only)**
2. گندم کا وزن (کلوگرام) درج کریں۔
3. ٹوکن نمبر اسکرین پر جلی حروف میں ظاہر ہوگا (مثلاً `#0042`)۔
4. ٹوکن پرنٹ کر کے کسٹمر کے گندم کے توڑے پر لگا دیا جاتا ہے۔
5. اسٹیٹس تبدیلی: `PENDING` -> `PROCESSING` -> `READY` -> `COLLECTED`.

---

## 5. Credit (Udhaar) Ledger Management (ادھار کھاتہ کا انتظام)

- **نیا کسٹمر شامل کرنا:** کسٹمر کا نام اور فون نمبر درج کریں۔
- **سابقہ بقایا کی منتقلی:** پرانا بقایا ابتدائی بیلنس میں درج کیا جا سکتا ہے۔
- **ادھار فروخت:** بل بناتے وقت `CREDIT` کا انتخاب کریں۔ کھاتہ میں خودکار ڈبل انٹری درج ہو گی۔
- **قسط / وصولی کا اندراج (Repayment):**
  1. کسٹمر پروفائل کھولیں۔
  2. "رقم وصول کریں (Receive Payment)" پر کلک کریں۔
  3. وصول شدہ نقد رقم درج کریں۔
  4. کسٹمر کو فوری اردو رسید پرنٹ کر کے فراہم کی جاتی ہے۔
  5. کھاتہ خودکار کم ہو جاتا ہے۔

---

## 6. Daily Closing & Z-Report (شام کی ڈے کلوزنگ اور حساب کتاب)

دن کے اختتام پر دکان بند کرتے وقت ڈے کلوزنگ کی جاتی ہے:
1. مینیو سے **"Daily Closing (روزانہ کلوزنگ)"** پر جائیں۔
2. اسکرین پر درج ذیل اعداد و شمار خودکار طور پر منجمد (Calculate) ہوں گے:
   - کل نقد فروخت (Cash Sales)
   - کل ادھار فروخت (Credit Sales)
   - پسائی کی آمدن (Pisai Revenue)
   - ادھار وصولیاں (Udhaar Recoveries)
   - دکان کے اخراجات منہا (Minus Shop Expenses)
   - **دراز میں متوقع رقم (Expected Cash in Drawer)**
3. دراز میں موجود اصل رقم گن کر **"Actual Cash"** خانے میں درج کریں۔
4. فرق (Difference) خودکار حساب ہو جائے گا (نقصان / زائد)۔
5. **"کلوز کریں اور لاک کریں"** پر کلک کریں:
   - ڈیٹا بیس کا فوری بیک اپ تیار ہو جاتا ہے (`flour_erp_backup_YYYY-MM-DD_HHmmss.db`)۔
   - تھرمل پرنٹر پر جامع **Z-Report** پرنٹ ہو جاتی ہے۔
   - وہ کاروباری دن مستقل طور پر لاک (Day-Lock) ہو جاتا ہے تاکہ پچھلی تاریخوں میں کوئی جعلسازی نہ ہو سکے۔

---

## 7. Bill Void & Audit Trail (بل منسوخی اور آڈٹ ٹریل)

- **بل منسوخی کے قواعد:**
  - بل منسوخ کرنے کا اختیار صرف سپرا ایڈمن اور ایڈمن کو ہے۔
  - بل منسوخ کرتے وقت اردو یا انگریزی میں معقول وجہ (Reason) لکھنا لازمی ہے۔
  - اگر منسوخ شدہ بل ادھار پر تھا تو کسٹمر کا کھاتہ خودکار طور پر ریورس ہو جائے گا۔
- **آڈٹ ٹریل (Audit Log):**
  - ہر حساس کارروائی (لاگ ان، ریٹ تبدیلی، بل منسوخی، کلوزنگ) سسٹم میں مستقل طور پر صارف کے نام، تاریخ، وقت اور کمپیوٹر آئی پی کے ساتھ محفوظ ہو جاتی ہے اور اسے مٹایا نہیں جا سکتا۔

---

## 8. Database Backup & Safety (ڈیٹا بیک اپ اور بحالی)

- **خودکار بیک اپ:** ہر روزانہ کلوزنگ کے وقت سسٹم خود بخود ایک مکمل بیک اپ فائل درج ذیل فولڈر میں بناتا ہے:
  `apps\api\backups\flour_erp_backup_YYYY-MM-DD_HHmmss.db`
- **ہفتہ وار احتیاط:** ہفتے میں ایک بار اس `backups` فولڈر کو کسی بیرونی USB فلیش ڈرائیو میں کاپی کر لیں۔
- **ایمرجنسی بحالی (Emergency Restore):**
  اگر کبھی ونڈوز یا ہارڈ ڈرائیو خراب ہو جائے تو تازہ ترین بیک اپ فائل کا نام بدل کر `dev.db` رکھیں اور `apps\api\prisma\` میں کاپی کر دیں۔ پورا ڈیٹا فوری بحال ہو جائے گا۔

---

## 9. Contact & Support (رابطہ برائے تکنیکی معاونت)
- **ڈویلپر:** Antigravity Engineering for Malik Hanzala Mushtaq & Sons
- **ورژن:** FlourERP v1.0 Production
- **پلیٹ فارم:** Windows 10/11 Local Node.js + SQLite Environment
