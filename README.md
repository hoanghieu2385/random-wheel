# random-wheel

random-wheel/
├── index.html                # File HTML chính
├── assets/                   
│   ├── css/
│   │   └── styles.css        # File CSS quản lý giao diện
│   ├── js/
│   │   ├── app.js            # JS chính khởi tạo ứng dụng
│   │   ├── storage.js        # Module quản lý lưu trữ (localStorage)
│   │   ├── input.js          # Xử lý logic ô nhập câu hỏi
│   │   ├── wheel.js          # Logic vòng quay
│   │   ├── popup.js          # Logic popup
│   │   └── utils.js          # Các hàm tiện ích
│   └── data/
│       ├── random_money.txt  # Gợi ý câu hỏi: random tiền lì xì
│       ├── truth_dare.txt    # Gợi ý câu hỏi: thật hay thách
│       └── other.txt         # Các câu hỏi gợi ý khác
├── components/               # Chứa các phần tử HTML nhỏ
│   ├── input.html            # HTML cho ô nhập câu hỏi
│   ├── wheel.html            # HTML cho vòng quay
│   └── popup.html            # HTML cho popup
└── README.md                 # Hướng dẫn dự án