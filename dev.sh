trap 'kill 0' EXIT

(cd client && npm run dev) &
(cd server && npm run dev) &
(cd ml-api && python3 app.py) &

wait