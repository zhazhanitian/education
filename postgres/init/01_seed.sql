-- 教学成果奖申报平台 - 初始种子数据
-- 首页核心统计数据
INSERT INTO home_stats (label, value, icon, sort_order, is_visible) VALUES
  ('获奖教学成果', '32 项',   'lucide:award',        1, true),
  ('参与教师团队', '186 人',  'lucide:users',        2, true),
  ('受益学生人数', '12000+',  'lucide:graduation-cap', 3, true),
  ('校企合作单位', '58 家',   'lucide:building-2',   4, true),
  ('科研竞赛获奖', '240 项',  'lucide:trophy',       5, true),
  ('覆盖专业方向', '16 个',   'lucide:book-open',    6, true)
ON CONFLICT DO NOTHING;

-- 首页配置
INSERT INTO home_configs (config_key, config_value, config_type, label) VALUES
  ('site_name',        '教学成果奖申报平台',                  'text',  '站点名称'),
  ('site_subtitle',    '展示卓越教学，传承创新精神',            'text',  '站点副标题'),
  ('hero_title',       '以改革引领创新  以质量成就未来',         'text',  '首页大标题'),
  ('hero_subtitle',    '深化教育教学改革，推动产教融合发展，打造高质量人才培养体系', 'text', '首页副标题'),
  ('hero_video_url',   'https://www.w3schools.com/html/mov_bbb.mp4', 'video', '首页宣传视频'),
  ('hero_video_cover', '/images/hero-cover.jpg',             'image', '视频封面图'),
  ('school_name',      '某某高等职业技术学院',                 'text',  '学校名称'),
  ('school_logo',      '/images/school-logo.png',            'image', '学校 Logo'),
  ('footer_copyright', '© 2024 某某高等职业技术学院  版权所有', 'text',  '底部版权')
ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value;

-- 一级导航菜单
INSERT INTO nav_menus (id, name, slug, sort_order, is_visible, parent_id) VALUES
  (1,  '首页',         'home',              0,  true, NULL),
  (2,  '成果申报',     'achievement',       1,  true, NULL),
  (3,  '图片视频',     'media',             2,  true, NULL),
  (4,  '人才培养',     'talent',            3,  true, NULL),
  (5,  '学生成果',     'student',           4,  true, NULL),
  (6,  '媒体交流',     'media-news',        5,  true, NULL),
  (7,  '典型案例',     'cases',             6,  true, NULL),
  (8,  '产业合作',     'industry',          7,  true, NULL),
  (9,  '数字化平台',   'digital',           8,  true, NULL)
ON CONFLICT (id) DO NOTHING;

-- 二级菜单
INSERT INTO nav_menus (id, name, slug, sort_order, is_visible, parent_id) VALUES
  (10, '成果申报书',       'achievement-application',  0, true, 2),
  (11, '成果总结报告',     'achievement-summary',      1, true, 2),
  (12, '成果附件',         'achievement-attachments',  2, true, 2),
  (13, '应用证明',         'achievement-proof',        3, true, 2),
  (14, '相关可视化数据',   'achievement-data',         4, true, 2),
  (20, '相关图片',         'media-photos',             0, true, 3),
  (21, '宣传视频',         'media-promo-video',        1, true, 3),
  (22, '教学视频',         'media-teaching-video',     2, true, 3),
  (23, '活动视频',         'media-activity-video',     3, true, 3),
  (24, '课堂实录',         'media-classroom',          4, true, 3),
  (30, '人才培养方案',     'talent-plan',              0, true, 4),
  (31, '学生成长全过程',   'talent-growth',            1, true, 4),
  (32, '评价标准',         'talent-evaluation',        2, true, 4),
  (33, '智慧课程',         'talent-smart-course',      3, true, 4),
  (34, '微专业',           'talent-micro-major',       4, true, 4),
  (40, '学生成果展示',     'student-showcase',         0, true, 5),
  (41, '学科竞赛获奖',     'student-competition',      1, true, 5),
  (42, '大创项目展示',     'student-innovation',       2, true, 5),
  (43, '学生创新成果',     'student-results',          3, true, 5),
  (50, '相关媒体报道',     'news-media',               0, true, 6),
  (51, '高校交流访谈',     'news-interview',           1, true, 6),
  (52, '新闻稿',           'news-press',               2, true, 6),
  (53, '照片',             'news-photos',              3, true, 6),
  (54, '杰出校友访谈',     'news-alumni',              4, true, 6),
  (60, '杰出毕业生典型案例','cases-graduates',         0, true, 7),
  (61, '企业导师风采',     'cases-mentors',            1, true, 7),
  (62, '产业教授进课堂',   'cases-professor',          2, true, 7),
  (70, '区域产业发展数据', 'industry-data',            0, true, 8),
  (71, '产业-专业-课程映射图谱','industry-map',        1, true, 8),
  (72, '厂中校/校中厂',   'industry-factory-school',  2, true, 8),
  (73, '政校企深度合作',   'industry-cooperation',    3, true, 8),
  (74, '合作案例展示',     'industry-cases',           4, true, 8),
  (80, '数字孪生虚拟仿真', 'digital-twin',             0, true, 9),
  (81, '智慧课程平台',     'digital-course',           1, true, 9),
  (82, '未来学习中心',     'digital-learning-center',  2, true, 9)
ON CONFLICT (id) DO NOTHING;

-- 默认超管账号 (密码: Admin@123456，需在应用层 bcrypt hash)
INSERT INTO admin_users (username, password_hash, real_name, role) VALUES
  ('admin', '$2b$10$placeholder_replace_on_first_login', '超级管理员', 'SUPER_ADMIN')
ON CONFLICT (username) DO NOTHING;
