#!/bin/bash

# Chạy frontend
cd frontend
npm run dev &
FRONT_PID=$!

# Chạy backend
cd ../backend
npm run dev &
BACK_PID=$!

# Đợi cả 2 process kết thúc
wait $FRONT_PID $BACK_PID