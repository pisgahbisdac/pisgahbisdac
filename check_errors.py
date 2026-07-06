from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

try:
    driver = webdriver.Chrome(options=options)
    driver.get('http://localhost:5173/laporan.html')
    time.sleep(3)
    
    # login
    driver.execute_script("document.getElementById('loginUsername').value = 'admin';")
    driver.execute_script("document.getElementById('loginPassword').value = 'Admin1117@!';")
    driver.execute_script("document.getElementById('loginBtn').click();")
    time.sleep(3)
    
    # click histori jurnal
    driver.execute_script("document.getElementById('navRiwayat').click();")
    time.sleep(2)
    
    logs = driver.get_log('browser')
    for log in logs:
        if log['level'] == 'SEVERE':
            print("ERROR:", log['message'])
    
    html = driver.execute_script("return document.getElementById('historyListContainer').innerHTML;")
    if html and "Data kosong" in html:
        print("TABLE IS EMPTY (Data kosong)")
    elif html:
        print("TABLE HAS DATA, length:", len(html))
    else:
        print("TABLE NOT FOUND OR EMPTY HTML")
    
    driver.quit()
except Exception as e:
    print("Python error:", str(e))
