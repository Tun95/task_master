import 'dotenv/config';
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: 'postgresql://task_master_user_db:5OOC8EqvLy0PVWgwnHwUcaSObStTvD6g@dpg-d6pna494tr6s7397tkng-a.oregon-postgres.render.com/task_master_db_txp4?sslmode=require',
  },
});
