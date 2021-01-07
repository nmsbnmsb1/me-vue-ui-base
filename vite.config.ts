import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [vue()],
	build: {
		base: '/static/',
	},
	// optimizeDeps: {
	// 	include: ['core-util-is'],
	// },
});
