import requests
import json
import schedule
import time
from datetime import datetime

# ============= 要改這兩行 =============
FULL_COOKIE = """貼入你的cookie內容"""

PROMO_DATA = {
    "m_promo_no": "M25111400098",
    "dt_promo_no": "D25111400001",
    "gift_code": "Gift001",
    "isRealityGiftGoods": "false"
}
# ================================================

def job():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}] 開始搶券！")

    url = "https://www.momoshop.com.tw/servlet/MemberCenterServ"

    headers = {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "cookie": FULL_COOKIE.strip(),
        "origin": "https://www.momoshop.com.tw",
        "referer": "https://www.momoshop.com.tw/mypage/MemberCenter.jsp?func=18&promoNo=20251027151551957",
        "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
        "x-requested-with": "XMLHttpRequest"
    }

    payload = {
        "data": json.dumps({
            "flag": 2027,
            "data": PROMO_DATA
        }, separators=(',', ':'))      # 跟網頁一模一樣的最小化 JSON
    }

    try:
        session = requests.Session()
        response = session.post(url, headers=headers, data=payload, timeout=15)

        print("狀態碼:", response.status_code)
        print("回應內容:", response.text)

        if "success" in response.text.lower() or "true" in response.text.lower():
            print("領取成功！！！")
        elif "已領取" in response.text or "重複" in response.text:
            print("已經領過了喔～")
        else:
            print("可能失敗、被擋或額滿，建議手動再試")
    except Exception as e:
        print("請求發生例外:", e)

# 每天晚上 20:00:00 執行（精準到秒）
schedule.every().day.at("20:30:00").do(job)

print("等待中... 程式將在本機時間每天 20:00:00 自動執行")
print("現在時間:", datetime.now().strftime('%Y-%m-%d %H:%M:%S'))


while True:
    schedule.run_pending()
    time.sleep(0.1)   # 0.1 秒檢查一次，延遲極低，幾乎可達到毫秒級觸發