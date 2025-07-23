--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: dthubuser
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO dthubuser;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: dthubuser
--

COMMENT ON SCHEMA public IS '';


--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA topology;


ALTER SCHEMA topology OWNER TO postgres;

--
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- Name: Role; Type: TYPE; Schema: public; Owner: dthubuser
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'USER',
    'VIEWER'
);


ALTER TYPE public."Role" OWNER TO dthubuser;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: dthubuser
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO dthubuser;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: dthubuser
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon text,
    image text,
    color text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "parentId" integer
);


ALTER TABLE public.categories OWNER TO dthubuser;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: dthubuser
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO dthubuser;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dthubuser
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: configs; Type: TABLE; Schema: public; Owner: dthubuser
--

CREATE TABLE public.configs (
    id integer NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    category text,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.configs OWNER TO dthubuser;

--
-- Name: configs_id_seq; Type: SEQUENCE; Schema: public; Owner: dthubuser
--

CREATE SEQUENCE public.configs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.configs_id_seq OWNER TO dthubuser;

--
-- Name: configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dthubuser
--

ALTER SEQUENCE public.configs_id_seq OWNED BY public.configs.id;


--
-- Name: data_models; Type: TABLE; Schema: public; Owner: dthubuser
--

CREATE TABLE public.data_models (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "dataType" text NOT NULL,
    "dataVersion" text,
    data jsonb NOT NULL,
    "dataSchema" text,
    "originalFormat" text,
    "boundingBox" jsonb,
    "centerPoint" text,
    "styleProperties" jsonb,
    "renderingMode" text DEFAULT 'default'::text NOT NULL,
    "animationSettings" jsonb,
    "interactionSettings" jsonb,
    "timeRange" text,
    "isTimeSeries" boolean DEFAULT false NOT NULL,
    "timeProperty" text,
    "processingStatus" text DEFAULT 'pending'::text NOT NULL,
    "processingLog" jsonb,
    "validationStatus" text DEFAULT 'pending'::text NOT NULL,
    "validationErrors" jsonb,
    "dataSize" integer,
    "featureCount" integer,
    "simplificationLevel" integer DEFAULT 0 NOT NULL,
    "cacheKey" text,
    active boolean DEFAULT true NOT NULL,
    tags text[],
    "isPublic" boolean DEFAULT true NOT NULL,
    "isApproved" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" integer NOT NULL,
    "modelTypeId" integer NOT NULL,
    "categoryId" integer
);


ALTER TABLE public.data_models OWNER TO dthubuser;

--
-- Name: data_models_id_seq; Type: SEQUENCE; Schema: public; Owner: dthubuser
--

CREATE SEQUENCE public.data_models_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.data_models_id_seq OWNER TO dthubuser;

--
-- Name: data_models_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dthubuser
--

ALTER SEQUENCE public.data_models_id_seq OWNED BY public.data_models.id;


--
-- Name: file_uploads; Type: TABLE; Schema: public; Owner: dthubuser
--

CREATE TABLE public.file_uploads (
    id integer NOT NULL,
    "originalName" text NOT NULL,
    "fileName" text NOT NULL,
    "filePath" text NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" text NOT NULL,
    category text,
    "isProcessed" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public.file_uploads OWNER TO dthubuser;

--
-- Name: file_uploads_id_seq; Type: SEQUENCE; Schema: public; Owner: dthubuser
--

CREATE SEQUENCE public.file_uploads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.file_uploads_id_seq OWNER TO dthubuser;

--
-- Name: file_uploads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dthubuser
--

ALTER SEQUENCE public.file_uploads_id_seq OWNED BY public.file_uploads.id;


--
-- Name: geojsons; Type: TABLE; Schema: public; Owner: dthubuser
--

CREATE TABLE public.geojsons (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    data jsonb NOT NULL,
    category text,
    tags text[],
    "isPublic" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" integer NOT NULL,
    "categoryId" integer
);


ALTER TABLE public.geojsons OWNER TO dthubuser;

--
-- Name: geojsons_id_seq; Type: SEQUENCE; Schema: public; Owner: dthubuser
--

CREATE SEQUENCE public.geojsons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.geojsons_id_seq OWNER TO dthubuser;

--
-- Name: geojsons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dthubuser
--

ALTER SEQUENCE public.geojsons_id_seq OWNED BY public.geojsons.id;


--
-- Name: infrastructure; Type: TABLE; Schema: public; Owner: dthubuser
--

CREATE TABLE public.infrastructure (
    id integer NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    location text,
    properties jsonb,
    status text DEFAULT 'active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" integer NOT NULL,
    "categoryId" integer
);


ALTER TABLE public.infrastructure OWNER TO dthubuser;

--
-- Name: infrastructure_id_seq; Type: SEQUENCE; Schema: public; Owner: dthubuser
--

CREATE SEQUENCE public.infrastructure_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.infrastructure_id_seq OWNER TO dthubuser;

--
-- Name: infrastructure_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dthubuser
--

ALTER SEQUENCE public.infrastructure_id_seq OWNED BY public.infrastructure.id;


--
-- Name: model_types; Type: TABLE; Schema: public; Owner: dthubuser
--

CREATE TABLE public.model_types (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon text,
    color text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "parentId" integer
);


ALTER TABLE public.model_types OWNER TO dthubuser;

--
-- Name: model_types_id_seq; Type: SEQUENCE; Schema: public; Owner: dthubuser
--

CREATE SEQUENCE public.model_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.model_types_id_seq OWNER TO dthubuser;

--
-- Name: model_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dthubuser
--

ALTER SEQUENCE public.model_types_id_seq OWNED BY public.model_types.id;


--
-- Name: models; Type: TABLE; Schema: public; Owner: dthubuser
--

CREATE TABLE public.models (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "fileSize" integer,
    "mimeType" text,
    category text,
    tags text[],
    "isPublic" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    heading double precision DEFAULT 0 NOT NULL,
    height double precision DEFAULT 0 NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    "maximumScale" integer DEFAULT 2000 NOT NULL,
    "minimumPixelSize" integer DEFAULT 64 NOT NULL,
    pitch double precision DEFAULT 0 NOT NULL,
    roll double precision DEFAULT 0 NOT NULL,
    scale double precision DEFAULT 1.0 NOT NULL,
    url text NOT NULL,
    "categoryId" integer
);


ALTER TABLE public.models OWNER TO dthubuser;

--
-- Name: models_id_seq; Type: SEQUENCE; Schema: public; Owner: dthubuser
--

CREATE SEQUENCE public.models_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.models_id_seq OWNER TO dthubuser;

--
-- Name: models_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dthubuser
--

ALTER SEQUENCE public.models_id_seq OWNED BY public.models.id;


--
-- Name: template_models; Type: TABLE; Schema: public; Owner: dthubuser
--

CREATE TABLE public.template_models (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    url text NOT NULL,
    thumbnail text,
    "fileSize" integer,
    "mimeType" text,
    dimensions jsonb,
    scale double precision DEFAULT 1.0 NOT NULL,
    "defaultHeight" double precision DEFAULT 0 NOT NULL,
    "minimumPixelSize" integer DEFAULT 64 NOT NULL,
    "maximumScale" integer DEFAULT 2000 NOT NULL,
    tags text[],
    "isPublic" boolean DEFAULT true NOT NULL,
    "isApproved" boolean DEFAULT false NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" integer NOT NULL,
    "modelTypeId" integer NOT NULL,
    "categoryId" integer
);


ALTER TABLE public.template_models OWNER TO dthubuser;

--
-- Name: template_models_id_seq; Type: SEQUENCE; Schema: public; Owner: dthubuser
--

CREATE SEQUENCE public.template_models_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.template_models_id_seq OWNER TO dthubuser;

--
-- Name: template_models_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dthubuser
--

ALTER SEQUENCE public.template_models_id_seq OWNED BY public.template_models.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: dthubuser
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    "firstName" text,
    "lastName" text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO dthubuser;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: dthubuser
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO dthubuser;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dthubuser
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: configs id; Type: DEFAULT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.configs ALTER COLUMN id SET DEFAULT nextval('public.configs_id_seq'::regclass);


--
-- Name: data_models id; Type: DEFAULT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.data_models ALTER COLUMN id SET DEFAULT nextval('public.data_models_id_seq'::regclass);


--
-- Name: file_uploads id; Type: DEFAULT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.file_uploads ALTER COLUMN id SET DEFAULT nextval('public.file_uploads_id_seq'::regclass);


--
-- Name: geojsons id; Type: DEFAULT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.geojsons ALTER COLUMN id SET DEFAULT nextval('public.geojsons_id_seq'::regclass);


--
-- Name: infrastructure id; Type: DEFAULT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.infrastructure ALTER COLUMN id SET DEFAULT nextval('public.infrastructure_id_seq'::regclass);


--
-- Name: model_types id; Type: DEFAULT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.model_types ALTER COLUMN id SET DEFAULT nextval('public.model_types_id_seq'::regclass);


--
-- Name: models id; Type: DEFAULT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.models ALTER COLUMN id SET DEFAULT nextval('public.models_id_seq'::regclass);


--
-- Name: template_models id; Type: DEFAULT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.template_models ALTER COLUMN id SET DEFAULT nextval('public.template_models_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: dthubuser
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a1281a6b-4827-4acd-ab3e-ecbedca21a7e	5e2c671b49bea019ff796f1beff3e976d9586313abfda20c7d615c0e5ea54902	2025-07-20 09:39:31.292238+07	20250629060544_init	\N	\N	2025-07-20 09:39:31.256871+07	1
7b6449a4-493c-4018-87fa-b5a9d94bda6f	86d94854732082f47a54ba79f72fbf2af4e59327c2a18f8445b309170b994552	2025-07-20 09:39:31.29785+07	20250629062054_update_model_legacy_compatibility	\N	\N	2025-07-20 09:39:31.293327+07	1
e72714cf-6433-4d72-abba-5357beb5afb6	84a3fa3c48ebf187290381ee269141c803c87c4350585099b480bf3a5cad0ed1	2025-07-20 09:39:31.311113+07	20250629105356_add_category_model	\N	\N	2025-07-20 09:39:31.298938+07	1
cc4fc096-6b99-473e-9563-6cefaaeeda28	0b1dabeeb15cfd15c28500f8d34b6fea8780b509f112275d40c996b1d0c6a9b7	2025-07-20 09:39:47.631834+07	20250720023947_add_new_tables	\N	\N	2025-07-20 09:39:47.602761+07	1
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: dthubuser
--

COPY public.categories (id, name, slug, description, icon, image, color, "isActive", "sortOrder", "createdAt", "updatedAt", "parentId") FROM stdin;
1	Infrastructure Models	infrastructure-models	Mô hình hạ tầng đô thị và công trình	🏗️	\N	#FF9800	t	1	2025-07-20 02:52:16.895	2025-07-20 03:02:03.858	\N
2	Vegetation Models	vegetation-models	Mô hình cây xanh và thực vật	🌳	\N	#4CAF50	t	2	2025-07-20 02:52:16.9	2025-07-20 03:02:03.862	\N
3	Transportation Models	transportation-models	Mô hình giao thông và vận tải	🚗	\N	#2196F3	t	3	2025-07-20 02:52:16.902	2025-07-20 03:02:03.864	\N
4	Urban Furniture	urban-furniture	Đồ đạc đô thị và tiện ích công cộng	🪑	\N	#9C27B0	t	4	2025-07-20 02:52:16.904	2025-07-20 03:02:03.865	\N
5	Building Models	building-models	Mô hình nhà cửa và công trình kiến trúc	🏢	\N	#795548	t	5	2025-07-20 02:52:16.905	2025-07-20 03:02:03.866	\N
6	Spatial Data	spatial-data	Dữ liệu không gian địa lý	🗺️	\N	#00BCD4	t	6	2025-07-20 02:52:16.906	2025-07-20 03:02:03.868	\N
7	Dynamic Data	dynamic-data	Dữ liệu động và time-series	📊	\N	#FF5722	t	7	2025-07-20 02:52:16.908	2025-07-20 03:02:03.87	\N
8	Electric Infrastructure	electric-infrastructure	Hạ tầng điện: cột điện, trạm biến áp	⚡	\N	#FFC107	t	1	2025-07-20 02:52:16.909	2025-07-20 03:02:03.871	1
9	Water Infrastructure	water-infrastructure	Hạ tầng nước: trạm bơm, đường ống	💧	\N	#03A9F4	t	2	2025-07-20 02:52:16.911	2025-07-20 03:02:03.873	1
10	Traffic Infrastructure	traffic-infrastructure	Hạ tầng giao thông: biển báo, đèn tín hiệu	🚦	\N	#F44336	t	3	2025-07-20 02:52:16.912	2025-07-20 03:02:03.874	1
11	Communication Infrastructure	communication-infrastructure	Hạ tầng viễn thông: trạm BTS, cột anten	📡	\N	#9E9E9E	t	4	2025-07-20 02:52:16.914	2025-07-20 03:02:03.876	1
12	Trees	trees	Cây cối các loại	🌲	\N	#2E7D32	t	1	2025-07-20 02:52:16.916	2025-07-20 03:02:03.877	2
13	Bushes & Shrubs	bushes-shrubs	Bụi cây và cây bụi	🌿	\N	#388E3C	t	2	2025-07-20 02:52:16.917	2025-07-20 03:02:03.879	2
14	Grass & Ground Cover	grass-ground-cover	Cỏ và thảm thực vật phủ đất	🌱	\N	#66BB6A	t	3	2025-07-20 02:52:16.919	2025-07-20 03:02:03.88	2
15	Flowers & Decorative Plants	flowers-decorative	Hoa và cây cảnh trang trí	🌸	\N	#E91E63	t	4	2025-07-20 02:52:16.921	2025-07-20 03:02:03.882	2
\.


--
-- Data for Name: configs; Type: TABLE DATA; Schema: public; Owner: dthubuser
--

COPY public.configs (id, key, value, category, description, "createdAt", "updatedAt") FROM stdin;
1	app_name	DTHub Platform	system	Tên ứng dụng hiển thị trên giao diện	2025-07-20 02:53:56.831	2025-07-20 03:02:03.894
2	app_version	2.0.0	system	Phiên bản hiện tại của ứng dụng	2025-07-20 02:53:56.833	2025-07-20 03:02:03.896
3	app_description	Nền tảng quản lý mô hình 3D và dữ liệu không gian đô thị	system	Mô tả ngắn về ứng dụng	2025-07-20 02:53:56.834	2025-07-20 03:02:03.898
4	maintenance_mode	false	system	Bật/tắt chế độ bảo trì hệ thống	2025-07-20 02:53:56.835	2025-07-20 03:02:03.899
5	debug_mode	false	system	Bật/tắt chế độ debug cho development	2025-07-20 02:53:56.836	2025-07-20 03:02:03.9
6	default_map_center_lat	10.7769	map	Vĩ độ trung tâm bản đồ mặc định (TP.HCM)	2025-07-20 02:53:56.838	2025-07-20 03:02:03.901
7	default_map_center_lng	106.7009	map	Kinh độ trung tâm bản đồ mặc định (TP.HCM)	2025-07-20 02:53:56.839	2025-07-20 03:02:03.902
8	default_map_zoom	12	map	Mức zoom mặc định của bản đồ	2025-07-20 02:53:56.841	2025-07-20 03:02:03.903
9	max_map_zoom	20	map	Mức zoom tối đa cho phép	2025-07-20 02:53:56.842	2025-07-20 03:02:03.904
10	min_map_zoom	3	map	Mức zoom tối thiểu cho phép	2025-07-20 02:53:56.843	2025-07-20 03:02:03.906
11	cesium_ion_token	your_cesium_ion_token_here	map	Cesium Ion access token cho Cesium viewer	2025-07-20 02:53:56.844	2025-07-20 03:02:03.907
12	enable_terrain	true	map	Bật/tắt hiển thị địa hình 3D	2025-07-20 02:53:56.846	2025-07-20 03:02:03.908
13	max_file_size_mb	50	upload	Kích thước file tối đa cho phép upload (MB)	2025-07-20 02:53:56.847	2025-07-20 03:02:03.909
14	allowed_model_formats	glb,gltf,obj,dae,3ds	upload	Các định dạng mô hình 3D được phép upload	2025-07-20 02:53:56.848	2025-07-20 03:02:03.91
15	allowed_image_formats	jpg,jpeg,png,gif,webp	upload	Các định dạng hình ảnh được phép upload	2025-07-20 02:53:56.849	2025-07-20 03:02:03.912
16	allowed_data_formats	geojson,kml,kmz,shp,csv	upload	Các định dạng dữ liệu không gian được phép upload	2025-07-20 02:53:56.85	2025-07-20 03:02:03.913
17	upload_require_approval	true	upload	Yêu cầu phê duyệt cho nội dung upload	2025-07-20 02:53:56.851	2025-07-20 03:02:03.914
18	max_models_per_scene	100	performance	Số lượng mô hình tối đa trên một scene	2025-07-20 02:53:56.852	2025-07-20 03:02:03.915
19	model_lod_enabled	true	performance	Bật/tắt Level of Detail cho mô hình	2025-07-20 02:53:56.853	2025-07-20 03:02:03.916
20	cache_enabled	true	performance	Bật/tắt cache cho tài nguyên	2025-07-20 02:53:56.854	2025-07-20 03:02:03.917
21	cache_duration_hours	24	performance	Thời gian cache tài nguyên (giờ)	2025-07-20 02:53:56.855	2025-07-20 03:02:03.919
22	enable_registration	true	security	Cho phép đăng ký tài khoản mới	2025-07-20 02:53:56.856	2025-07-20 03:02:03.92
23	require_email_verification	false	security	Yêu cầu xác thực email khi đăng ký	2025-07-20 02:53:56.857	2025-07-20 03:02:03.921
24	password_min_length	6	security	Độ dài tối thiểu của mật khẩu	2025-07-20 02:53:56.858	2025-07-20 03:02:03.922
25	session_timeout_minutes	60	security	Thời gian timeout của session (phút)	2025-07-20 02:53:56.859	2025-07-20 03:02:03.923
26	max_login_attempts	5	security	Số lần đăng nhập sai tối đa trước khi khóa	2025-07-20 02:53:56.86	2025-07-20 03:02:03.924
27	api_rate_limit_per_minute	100	api	Giới hạn số request API mỗi phút	2025-07-20 02:53:56.861	2025-07-20 03:02:03.925
28	api_enable_cors	true	api	Bật/tắt CORS cho API	2025-07-20 02:53:56.862	2025-07-20 03:02:03.926
29	api_allowed_origins	http://localhost:3000,http://localhost:3001	api	Các domain được phép gọi API	2025-07-20 02:53:56.863	2025-07-20 03:02:03.927
30	email_notifications_enabled	false	notification	Bật/tắt thông báo qua email	2025-07-20 02:53:56.865	2025-07-20 03:02:03.929
31	smtp_host	smtp.gmail.com	notification	SMTP server host	2025-07-20 02:53:56.866	2025-07-20 03:02:03.93
32	smtp_port	587	notification	SMTP server port	2025-07-20 02:53:56.867	2025-07-20 03:02:03.931
33	admin_email	admin@dthub.com	notification	Email của admin hệ thống	2025-07-20 02:53:56.869	2025-07-20 03:02:03.932
34	analytics_enabled	true	analytics	Bật/tắt thu thập dữ liệu analytics	2025-07-20 02:53:56.87	2025-07-20 03:02:03.933
35	google_analytics_id		analytics	Google Analytics tracking ID	2025-07-20 02:53:56.871	2025-07-20 03:02:03.934
36	track_user_interactions	true	analytics	Theo dõi tương tác của người dùng	2025-07-20 02:53:56.872	2025-07-20 03:02:03.935
37	auto_backup_enabled	true	backup	Bật/tắt sao lưu tự động	2025-07-20 02:53:56.873	2025-07-20 03:02:03.936
38	backup_interval_hours	24	backup	Khoảng thời gian sao lưu tự động (giờ)	2025-07-20 02:53:56.875	2025-07-20 03:02:03.937
39	backup_retention_days	30	backup	Số ngày lưu trữ file backup	2025-07-20 02:53:56.876	2025-07-20 03:02:03.938
40	default_theme	light	ui	Giao diện mặc định (light/dark)	2025-07-20 02:53:56.877	2025-07-20 03:02:03.939
41	enable_dark_mode	true	ui	Cho phép chuyển đổi dark mode	2025-07-20 02:53:56.878	2025-07-20 03:02:03.941
42	primary_color	#2196F3	ui	Màu chủ đạo của giao diện	2025-07-20 02:53:56.879	2025-07-20 03:02:03.942
43	company_logo_url	/images/dthub-logo.png	ui	URL logo công ty	2025-07-20 02:53:56.88	2025-07-20 03:02:03.943
44	favicon_url	/images/favicon.ico	ui	URL favicon	2025-07-20 02:53:56.881	2025-07-20 03:02:03.945
89	upload_base_path	/uploads	storage	Base path cho user uploads	2025-07-20 03:02:03.946	2025-07-20 03:02:03.946
90	template_base_path	/templates	storage	Base path cho template files	2025-07-20 03:02:03.947	2025-07-20 03:02:03.947
91	cache_base_path	/cache	storage	Base path cho cached files	2025-07-20 03:02:03.948	2025-07-20 03:02:03.948
92	max_folder_depth	5	storage	Độ sâu thư mục tối đa	2025-07-20 03:02:03.949	2025-07-20 03:02:03.949
93	auto_create_folders	true	storage	Tự động tạo thư mục khi upload	2025-07-20 03:02:03.95	2025-07-20 03:02:03.95
94	thumbnail_sizes	150x150,300x300,600x600	storage	Kích thước thumbnail được tạo tự động	2025-07-20 03:02:03.951	2025-07-20 03:02:03.951
95	file_cleanup_days	7	storage	Số ngày tự động xóa file temp	2025-07-20 03:02:03.952	2025-07-20 03:02:03.952
96	max_user_storage_gb	5	storage	Quota lưu trữ tối đa mỗi user (GB)	2025-07-20 03:02:03.953	2025-07-20 03:02:03.953
97	current_models_path	/uploads/models/2025/07	storage	Đường dẫn hiện tại cho 3D models (sau migration)	2025-07-20 03:10:56.568	2025-07-20 03:10:56.568
98	current_geojson_path	/uploads/geojson/2025/07	storage	Đường dẫn hiện tại cho GeoJSON files (sau migration)	2025-07-20 03:10:56.572	2025-07-20 03:10:56.572
99	migration_completed	true	storage	Đánh dấu đã hoàn thành migration file structure	2025-07-20 03:10:56.574	2025-07-20 03:10:56.574
100	migration_date	2025-07-20T03:10:56.575Z	storage	Ngày thực hiện migration	2025-07-20 03:10:56.576	2025-07-20 03:10:56.576
\.


--
-- Data for Name: data_models; Type: TABLE DATA; Schema: public; Owner: dthubuser
--

COPY public.data_models (id, name, description, "dataType", "dataVersion", data, "dataSchema", "originalFormat", "boundingBox", "centerPoint", "styleProperties", "renderingMode", "animationSettings", "interactionSettings", "timeRange", "isTimeSeries", "timeProperty", "processingStatus", "processingLog", "validationStatus", "validationErrors", "dataSize", "featureCount", "simplificationLevel", "cacheKey", active, tags, "isPublic", "isApproved", "createdAt", "updatedAt", "userId", "modelTypeId", "categoryId") FROM stdin;
1	Ranh Giới Quận 1 TP.HCM	Ranh giới hành chính Quận 1, Thành phố Hồ Chí Minh	GEOJSON	\N	{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[106.695, 10.762], [106.705, 10.762], [106.705, 10.772], [106.695, 10.772], [106.695, 10.762]]]}, "properties": {"name": "Quận 1", "area_km2": 7.73, "population": 204899, "admin_level": "district"}}]}	\N	\N	\N	POINT(106.7 10.767)	{"fillColor": "#FF5722", "fillOpacity": 0.3, "strokeColor": "#D32F2F", "strokeWidth": 2}	default	\N	\N	\N	f	\N	pending	\N	pending	\N	2048	1	0	\N	t	{boundary,district,administrative,hcmc}	t	t	2025-07-20 02:44:52.366	2025-07-20 02:44:52.366	1	7	\N
2	Tuyến Metro Số 1 TP.HCM	Tuyến metro số 1 Bến Thành - Suối Tiên	GEOJSON	\N	{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "LineString", "coordinates": [[106.695, 10.762], [106.705, 10.772], [106.715, 10.782], [106.725, 10.792], [106.735, 10.802]]}, "properties": {"name": "Metro Line 1", "status": "under_construction", "stations": 14, "length_km": 19.7, "transport": "subway"}}]}	\N	\N	\N	POINT(106.715 10.782)	{"strokeColor": "#2196F3", "strokeWidth": 4, "strokeOpacity": 0.8}	default	\N	\N	\N	f	\N	pending	\N	pending	\N	1024	1	0	\N	t	{metro,transportation,public-transport,hcmc}	t	t	2025-07-20 02:44:52.369	2025-07-20 02:44:52.369	1	7	\N
\.


--
-- Data for Name: file_uploads; Type: TABLE DATA; Schema: public; Owner: dthubuser
--

COPY public.file_uploads (id, "originalName", "fileName", "filePath", "fileSize", "mimeType", category, "isProcessed", "createdAt", "updatedAt", "userId") FROM stdin;
5	20250629182111508_lo_dat_10.geojson	20250720103629866_20250629182111508_lo_dat_10.geojson	/uploads/geojson/2025/07/20250720103629866_20250629182111508_lo_dat_10.geojson	10131	application/octet-stream	geojson	f	2025-07-20 03:36:29.87	2025-07-20 03:36:29.87	1
7	20250703010328312_bike_racks.geojson	20250720110348091_20250703010328312_bike_racks.geojson	/uploads/geojson/2025/07/20250720110348091_20250703010328312_bike_racks.geojson	331452	application/octet-stream	geojson	f	2025-07-20 04:03:48.095	2025-07-20 04:03:48.095	1
\.


--
-- Data for Name: geojsons; Type: TABLE DATA; Schema: public; Owner: dthubuser
--

COPY public.geojsons (id, name, description, data, category, tags, "isPublic", "createdAt", "updatedAt", "userId", "categoryId") FROM stdin;
1	ABCD	\N	{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[108.22, 16.065], [108.225, 16.065], [108.225, 16.07], [108.22, 16.07], [108.22, 16.065]]]}, "properties": {"area": 1000, "name": "Sample Polygon", "description": "This is a sample polygon feature"}}]}	\N	{}	t	2025-07-20 02:42:44.702	2025-07-20 02:42:44.702	1	\N
2	Ranh Giới Quận 1 - TP.HCM	Ranh giới hành chính Quận 1, Thành phố Hồ Chí Minh với thông tin dân số và diện tích	{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[106.695, 10.762], [106.705, 10.762], [106.705, 10.772], [106.695, 10.772], [106.695, 10.762]]]}, "properties": {"name": "Quận 1", "name_en": "District 1", "area_km2": 7.73, "population": 204899, "admin_level": "district", "description": "Trung tâm thương mại và tài chính của TP.HCM", "postal_code": "70000", "density_per_km2": 26503, "established_year": 1975}}]}	administrative_boundary	{boundary,district,administrative,hcmc,district1}	t	2025-07-20 02:52:16.923	2025-07-20 02:52:16.923	1	6
3	Tuyến Metro Số 1 - Bến Thành - Suối Tiên	Tuyến metro số 1 đầu tiên của TP.HCM, nối từ Bến Thành đến Suối Tiên	{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "LineString", "coordinates": [[106.6955, 10.7724], [106.6992, 10.7754], [106.7038, 10.7796], [106.7089, 10.7842], [106.7156, 10.7923], [106.7234, 10.8012], [106.7345, 10.8156], [106.7456, 10.8234], [106.7567, 10.8345], [106.7678, 10.8456], [106.7789, 10.8567], [106.7823, 10.8623], [106.7856, 10.8678], [106.7912, 10.8734]]}, "properties": {"name": "Metro Line 1", "status": "under_construction", "name_vi": "Tuyến Metro Số 1", "length_km": 19.7, "contractor": "MAUR (Japan)", "end_station": "Suối Tiên", "start_station": "Bến Thành", "investment_usd": "2.49 billion", "stations_count": 14, "transport_type": "subway", "estimated_completion": "2025", "capacity_passengers_per_hour": 40000}}]}	transportation	{metro,transportation,public-transport,hcmc,line1,subway}	t	2025-07-20 02:52:16.926	2025-07-20 02:52:16.926	1	6
4	Các Trường Đại Học Quận 1	Vị trí các trường đại học và cao đẳng tại Quận 1, TP.HCM	{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [106.6973, 10.7708]}, "properties": {"name": "Đại học Kinh tế TP.HCM", "type": "university", "founded": 1976, "name_en": "University of Economics Ho Chi Minh City", "website": "https://ueh.edu.vn", "students": 60000, "faculties": 15, "ranking_vietnam": "Top 3 Economics"}}, {"type": "Feature", "geometry": {"type": "Point", "coordinates": [106.6945, 10.7692]}, "properties": {"name": "Đại học Khoa học Xã hội và Nhân văn", "type": "university", "founded": 1957, "name_en": "VNU University of Social Sciences and Humanities", "website": "https://hcmussh.edu.vn", "students": 25000, "faculties": 18, "ranking_vietnam": "Top 1 Humanities"}}, {"type": "Feature", "geometry": {"type": "Point", "coordinates": [106.6889, 10.7634]}, "properties": {"name": "Đại học Luật TP.HCM", "type": "university", "founded": 1996, "name_en": "Ho Chi Minh City University of Law", "website": "https://hcmulaw.edu.vn", "students": 15000, "faculties": 8, "ranking_vietnam": "Top 2 Law"}}]}	education	{university,education,district1,hcmc,higher_education}	t	2025-07-20 02:52:16.928	2025-07-20 02:52:16.928	1	6
5	Công Viên và Khu Vui Chơi Quận 1	Vị trí các công viên, khu vui chơi giải trí tại Quận 1	{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[106.6978, 10.7698], [106.6989, 10.7698], [106.6989, 10.7708], [106.6978, 10.7708], [106.6978, 10.7698]]]}, "properties": {"name": "Công viên 30/4", "type": "park", "area_m2": 12000, "name_en": "April 30th Park", "features": ["playground", "walking_path", "fountain", "monument"], "entrance_fee": "Free", "opening_hours": "05:00-22:00"}}, {"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[106.6912, 10.7723], [106.6945, 10.7723], [106.6945, 10.7756], [106.6912, 10.7756], [106.6912, 10.7723]]]}, "properties": {"name": "Công viên Tao Đàn", "type": "park", "area_m2": 100000, "name_en": "Tao Dan Park", "features": ["bird_garden", "exercise_area", "cultural_house", "lake"], "entrance_fee": "10,000 VND", "opening_hours": "05:00-21:00"}}]}	recreation	{park,recreation,green_space,district1,hcmc}	t	2025-07-20 02:52:16.93	2025-07-20 02:52:16.93	1	6
6	Mạng Lưới Cửa Hàng Tiện Lợi Quận 1	Vị trí các cửa hàng tiện lợi Circle K, FamilyMart tại Quận 1	{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [106.7013, 10.7743]}, "properties": {"name": "Circle K Nguyễn Huệ", "type": "convenience_store", "brand": "Circle K", "address": "Đường Nguyễn Huệ, Quận 1", "services": ["ATM", "wifi", "charging_station", "copy_service"], "opening_hours": "24/7"}}, {"type": "Feature", "geometry": {"type": "Point", "coordinates": [106.6998, 10.7712]}, "properties": {"name": "FamilyMart Lê Lợi", "type": "convenience_store", "brand": "FamilyMart", "address": "Đường Lê Lợi, Quận 1", "services": ["ATM", "wifi", "food_court", "delivery"], "opening_hours": "24/7"}}, {"type": "Feature", "geometry": {"type": "Point", "coordinates": [106.6981, 10.7721]}, "properties": {"name": "Circle K Bến Thành", "type": "convenience_store", "brand": "Circle K", "address": "Gần Chợ Bến Thành, Quận 1", "services": ["ATM", "wifi", "charging_station"], "opening_hours": "24/7"}}]}	retail	{convenience_store,retail,commercial,district1,hcmc}	t	2025-07-20 02:52:16.931	2025-07-20 02:52:16.931	1	6
7	Ranh Giới Quận 1 - TP.HCM	Ranh giới hành chính Quận 1, Thành phố Hồ Chí Minh với thông tin dân số và diện tích	{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[106.695, 10.762], [106.705, 10.762], [106.705, 10.772], [106.695, 10.772], [106.695, 10.762]]]}, "properties": {"name": "Quận 1", "name_en": "District 1", "area_km2": 7.73, "population": 204899, "admin_level": "district", "description": "Trung tâm thương mại và tài chính của TP.HCM", "postal_code": "70000", "density_per_km2": 26503, "established_year": 1975}}]}	administrative_boundary	{boundary,district,administrative,hcmc,district1}	t	2025-07-20 02:53:56.821	2025-07-20 02:53:56.821	1	6
8	Tuyến Metro Số 1 - Bến Thành - Suối Tiên	Tuyến metro số 1 đầu tiên của TP.HCM, nối từ Bến Thành đến Suối Tiên	{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "LineString", "coordinates": [[106.6955, 10.7724], [106.6992, 10.7754], [106.7038, 10.7796], [106.7089, 10.7842], [106.7156, 10.7923], [106.7234, 10.8012], [106.7345, 10.8156], [106.7456, 10.8234], [106.7567, 10.8345], [106.7678, 10.8456], [106.7789, 10.8567], [106.7823, 10.8623], [106.7856, 10.8678], [106.7912, 10.8734]]}, "properties": {"name": "Metro Line 1", "status": "under_construction", "name_vi": "Tuyến Metro Số 1", "length_km": 19.7, "contractor": "MAUR (Japan)", "end_station": "Suối Tiên", "start_station": "Bến Thành", "investment_usd": "2.49 billion", "stations_count": 14, "transport_type": "subway", "estimated_completion": "2025", "capacity_passengers_per_hour": 40000}}]}	transportation	{metro,transportation,public-transport,hcmc,line1,subway}	t	2025-07-20 02:53:56.825	2025-07-20 02:53:56.825	1	6
9	Các Trường Đại Học Quận 1	Vị trí các trường đại học và cao đẳng tại Quận 1, TP.HCM	{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [106.6973, 10.7708]}, "properties": {"name": "Đại học Kinh tế TP.HCM", "type": "university", "founded": 1976, "name_en": "University of Economics Ho Chi Minh City", "website": "https://ueh.edu.vn", "students": 60000, "faculties": 15, "ranking_vietnam": "Top 3 Economics"}}, {"type": "Feature", "geometry": {"type": "Point", "coordinates": [106.6945, 10.7692]}, "properties": {"name": "Đại học Khoa học Xã hội và Nhân văn", "type": "university", "founded": 1957, "name_en": "VNU University of Social Sciences and Humanities", "website": "https://hcmussh.edu.vn", "students": 25000, "faculties": 18, "ranking_vietnam": "Top 1 Humanities"}}, {"type": "Feature", "geometry": {"type": "Point", "coordinates": [106.6889, 10.7634]}, "properties": {"name": "Đại học Luật TP.HCM", "type": "university", "founded": 1996, "name_en": "Ho Chi Minh City University of Law", "website": "https://hcmulaw.edu.vn", "students": 15000, "faculties": 8, "ranking_vietnam": "Top 2 Law"}}]}	education	{university,education,district1,hcmc,higher_education}	t	2025-07-20 02:53:56.826	2025-07-20 02:53:56.826	1	6
10	Công Viên và Khu Vui Chơi Quận 1	Vị trí các công viên, khu vui chơi giải trí tại Quận 1	{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[106.6978, 10.7698], [106.6989, 10.7698], [106.6989, 10.7708], [106.6978, 10.7708], [106.6978, 10.7698]]]}, "properties": {"name": "Công viên 30/4", "type": "park", "area_m2": 12000, "name_en": "April 30th Park", "features": ["playground", "walking_path", "fountain", "monument"], "entrance_fee": "Free", "opening_hours": "05:00-22:00"}}, {"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[106.6912, 10.7723], [106.6945, 10.7723], [106.6945, 10.7756], [106.6912, 10.7756], [106.6912, 10.7723]]]}, "properties": {"name": "Công viên Tao Đàn", "type": "park", "area_m2": 100000, "name_en": "Tao Dan Park", "features": ["bird_garden", "exercise_area", "cultural_house", "lake"], "entrance_fee": "10,000 VND", "opening_hours": "05:00-21:00"}}]}	recreation	{park,recreation,green_space,district1,hcmc}	t	2025-07-20 02:53:56.828	2025-07-20 02:53:56.828	1	6
11	Mạng Lưới Cửa Hàng Tiện Lợi Quận 1	Vị trí các cửa hàng tiện lợi Circle K, FamilyMart tại Quận 1	{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [106.7013, 10.7743]}, "properties": {"name": "Circle K Nguyễn Huệ", "type": "convenience_store", "brand": "Circle K", "address": "Đường Nguyễn Huệ, Quận 1", "services": ["ATM", "wifi", "charging_station", "copy_service"], "opening_hours": "24/7"}}, {"type": "Feature", "geometry": {"type": "Point", "coordinates": [106.6998, 10.7712]}, "properties": {"name": "FamilyMart Lê Lợi", "type": "convenience_store", "brand": "FamilyMart", "address": "Đường Lê Lợi, Quận 1", "services": ["ATM", "wifi", "food_court", "delivery"], "opening_hours": "24/7"}}, {"type": "Feature", "geometry": {"type": "Point", "coordinates": [106.6981, 10.7721]}, "properties": {"name": "Circle K Bến Thành", "type": "convenience_store", "brand": "Circle K", "address": "Gần Chợ Bến Thành, Quận 1", "services": ["ATM", "wifi", "charging_station"], "opening_hours": "24/7"}}]}	retail	{convenience_store,retail,commercial,district1,hcmc}	t	2025-07-20 02:53:56.83	2025-07-20 02:53:56.83	1	6
12	Ranh Giới Quận 1 - TP.HCM	Ranh giới hành chính Quận 1, Thành phố Hồ Chí Minh với thông tin dân số và diện tích	{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[106.695, 10.762], [106.705, 10.762], [106.705, 10.772], [106.695, 10.772], [106.695, 10.762]]]}, "properties": {"name": "Quận 1", "name_en": "District 1", "area_km2": 7.73, "population": 204899, "admin_level": "district", "description": "Trung tâm thương mại và tài chính của TP.HCM", "postal_code": "70000", "density_per_km2": 26503, "established_year": 1975}}]}	administrative_boundary	{boundary,district,administrative,hcmc,district1}	t	2025-07-20 03:02:03.884	2025-07-20 03:02:03.884	1	6
13	Tuyến Metro Số 1 - Bến Thành - Suối Tiên	Tuyến metro số 1 đầu tiên của TP.HCM, nối từ Bến Thành đến Suối Tiên	{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "LineString", "coordinates": [[106.6955, 10.7724], [106.6992, 10.7754], [106.7038, 10.7796], [106.7089, 10.7842], [106.7156, 10.7923], [106.7234, 10.8012], [106.7345, 10.8156], [106.7456, 10.8234], [106.7567, 10.8345], [106.7678, 10.8456], [106.7789, 10.8567], [106.7823, 10.8623], [106.7856, 10.8678], [106.7912, 10.8734]]}, "properties": {"name": "Metro Line 1", "status": "under_construction", "name_vi": "Tuyến Metro Số 1", "length_km": 19.7, "contractor": "MAUR (Japan)", "end_station": "Suối Tiên", "start_station": "Bến Thành", "investment_usd": "2.49 billion", "stations_count": 14, "transport_type": "subway", "estimated_completion": "2025", "capacity_passengers_per_hour": 40000}}]}	transportation	{metro,transportation,public-transport,hcmc,line1,subway}	t	2025-07-20 03:02:03.887	2025-07-20 03:02:03.887	1	6
14	Các Trường Đại Học Quận 1	Vị trí các trường đại học và cao đẳng tại Quận 1, TP.HCM	{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [106.6973, 10.7708]}, "properties": {"name": "Đại học Kinh tế TP.HCM", "type": "university", "founded": 1976, "name_en": "University of Economics Ho Chi Minh City", "website": "https://ueh.edu.vn", "students": 60000, "faculties": 15, "ranking_vietnam": "Top 3 Economics"}}, {"type": "Feature", "geometry": {"type": "Point", "coordinates": [106.6945, 10.7692]}, "properties": {"name": "Đại học Khoa học Xã hội và Nhân văn", "type": "university", "founded": 1957, "name_en": "VNU University of Social Sciences and Humanities", "website": "https://hcmussh.edu.vn", "students": 25000, "faculties": 18, "ranking_vietnam": "Top 1 Humanities"}}, {"type": "Feature", "geometry": {"type": "Point", "coordinates": [106.6889, 10.7634]}, "properties": {"name": "Đại học Luật TP.HCM", "type": "university", "founded": 1996, "name_en": "Ho Chi Minh City University of Law", "website": "https://hcmulaw.edu.vn", "students": 15000, "faculties": 8, "ranking_vietnam": "Top 2 Law"}}]}	education	{university,education,district1,hcmc,higher_education}	t	2025-07-20 03:02:03.889	2025-07-20 03:02:03.889	1	6
15	Công Viên và Khu Vui Chơi Quận 1	Vị trí các công viên, khu vui chơi giải trí tại Quận 1	{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[106.6978, 10.7698], [106.6989, 10.7698], [106.6989, 10.7708], [106.6978, 10.7708], [106.6978, 10.7698]]]}, "properties": {"name": "Công viên 30/4", "type": "park", "area_m2": 12000, "name_en": "April 30th Park", "features": ["playground", "walking_path", "fountain", "monument"], "entrance_fee": "Free", "opening_hours": "05:00-22:00"}}, {"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[106.6912, 10.7723], [106.6945, 10.7723], [106.6945, 10.7756], [106.6912, 10.7756], [106.6912, 10.7723]]]}, "properties": {"name": "Công viên Tao Đàn", "type": "park", "area_m2": 100000, "name_en": "Tao Dan Park", "features": ["bird_garden", "exercise_area", "cultural_house", "lake"], "entrance_fee": "10,000 VND", "opening_hours": "05:00-21:00"}}]}	recreation	{park,recreation,green_space,district1,hcmc}	t	2025-07-20 03:02:03.89	2025-07-20 03:02:03.89	1	6
16	Mạng Lưới Cửa Hàng Tiện Lợi Quận 1	Vị trí các cửa hàng tiện lợi Circle K, FamilyMart tại Quận 1	{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [106.7013, 10.7743]}, "properties": {"name": "Circle K Nguyễn Huệ", "type": "convenience_store", "brand": "Circle K", "address": "Đường Nguyễn Huệ, Quận 1", "services": ["ATM", "wifi", "charging_station", "copy_service"], "opening_hours": "24/7"}}, {"type": "Feature", "geometry": {"type": "Point", "coordinates": [106.6998, 10.7712]}, "properties": {"name": "FamilyMart Lê Lợi", "type": "convenience_store", "brand": "FamilyMart", "address": "Đường Lê Lợi, Quận 1", "services": ["ATM", "wifi", "food_court", "delivery"], "opening_hours": "24/7"}}, {"type": "Feature", "geometry": {"type": "Point", "coordinates": [106.6981, 10.7721]}, "properties": {"name": "Circle K Bến Thành", "type": "convenience_store", "brand": "Circle K", "address": "Gần Chợ Bến Thành, Quận 1", "services": ["ATM", "wifi", "charging_station"], "opening_hours": "24/7"}}]}	retail	{convenience_store,retail,commercial,district1,hcmc}	t	2025-07-20 03:02:03.893	2025-07-20 03:02:03.893	1	6
\.


--
-- Data for Name: infrastructure; Type: TABLE DATA; Schema: public; Owner: dthubuser
--

COPY public.infrastructure (id, name, type, location, properties, status, "createdAt", "updatedAt", "userId", "categoryId") FROM stdin;
1	Trạm Biến Áp 22kV Bến Thành	transformer_station	POINT(106.697 10.772)	{"capacity": "630kVA", "manufacturer": "Schneider Electric", "voltage_primary": "22kV", "installation_year": 2020, "voltage_secondary": "0.4kV", "maintenance_schedule": "quarterly"}	active	2025-07-20 02:44:52.371	2025-07-20 02:44:52.371	1	\N
2	Trạm Bơm Nước Quận 1	water_pump_station	POINT(106.692 10.768)	{"pump_count": 3, "capacity_m3h": 500, "pressure_bar": 3.5, "backup_generator": true, "water_quality_monitoring": true}	active	2025-07-20 02:44:52.373	2025-07-20 02:44:52.373	1	\N
3	Trung Tâm Giám Sát Giao Thông	traffic_control_center	POINT(106.700 10.775)	{"ai_analytics": true, "camera_count": 24, "operating_hours": "24/7", "coverage_radius_km": 5, "emergency_response": true}	active	2025-07-20 02:44:52.374	2025-07-20 02:44:52.374	1	\N
\.


--
-- Data for Name: model_types; Type: TABLE DATA; Schema: public; Owner: dthubuser
--

COPY public.model_types (id, name, slug, description, icon, color, "isActive", "sortOrder", "createdAt", "updatedAt", "parentId") FROM stdin;
1	Infrastructure	infrastructure	Hạ tầng đô thị	🏗️	#FFC107	t	1	2025-07-20 02:44:52.311	2025-07-20 02:44:52.311	\N
2	Vegetation	vegetation	Cây xanh và thực vật	🌳	#4CAF50	t	2	2025-07-20 02:44:52.317	2025-07-20 02:44:52.317	\N
3	Transportation	transportation	Giao thông và vận tải	🚗	#2196F3	t	3	2025-07-20 02:44:52.318	2025-07-20 02:44:52.318	\N
4	Utilities	utilities	Tiện ích công cộng	⚡	#FF9800	t	4	2025-07-20 02:44:52.319	2025-07-20 02:44:52.319	\N
5	Buildings	buildings	Công trình xây dựng	🏢	#795548	t	5	2025-07-20 02:44:52.321	2025-07-20 02:44:52.321	\N
6	Street Furniture	street-furniture	Đồ đạc đường phố	🪑	#9C27B0	t	6	2025-07-20 02:44:52.322	2025-07-20 02:44:52.322	\N
7	Geospatial Data	geospatial-data	Dữ liệu không gian địa lý	🗺️	#00BCD4	t	7	2025-07-20 02:44:52.323	2025-07-20 02:44:52.323	\N
8	Dynamic Data	dynamic-data	Dữ liệu động và time-series	📊	#FF5722	t	8	2025-07-20 02:44:52.325	2025-07-20 02:44:52.325	\N
9	Virtual Objects	virtual-objects	Đối tượng ảo và visualization	🎯	#E91E63	t	9	2025-07-20 02:44:52.326	2025-07-20 02:44:52.326	\N
10	Electric Poles	electric-poles	Cột điện các loại	🔌	#FFEB3B	t	1	2025-07-20 02:44:52.329	2025-07-20 02:44:52.329	1
11	Traffic Signs	traffic-signs	Biển báo giao thông	🚦	#F44336	t	2	2025-07-20 02:44:52.332	2025-07-20 02:44:52.332	1
12	Streetlights	streetlights	Đèn đường	💡	#FFC107	t	3	2025-07-20 02:44:52.333	2025-07-20 02:44:52.333	1
13	Manholes	manholes	Nắp cống	🕳️	#607D8B	t	4	2025-07-20 02:44:52.334	2025-07-20 02:44:52.334	1
14	Trees	trees	Cây cối các loại	🌲	#2E7D32	t	1	2025-07-20 02:44:52.337	2025-07-20 02:44:52.337	2
15	Bushes	bushes	Bụi cây	🌿	#388E3C	t	2	2025-07-20 02:44:52.338	2025-07-20 02:44:52.338	2
16	Grass	grass	Cỏ và thảm cỏ	🌱	#66BB6A	t	3	2025-07-20 02:44:52.34	2025-07-20 02:44:52.34	2
17	Flowers	flowers	Hoa và cây cảnh	🌸	#E91E63	t	4	2025-07-20 02:44:52.342	2025-07-20 02:44:52.342	2
\.


--
-- Data for Name: models; Type: TABLE DATA; Schema: public; Owner: dthubuser
--

COPY public.models (id, name, description, "fileSize", "mimeType", category, tags, "isPublic", "createdAt", "updatedAt", "userId", active, heading, height, latitude, longitude, "maximumScale", "minimumPixelSize", pitch, roll, scale, url, "categoryId") FROM stdin;
3	test 1	\N	\N	\N	\N	{}	f	2025-07-20 03:44:01.249	2025-07-20 03:44:01.249	1	t	0	100	16.13529628600182	108.2250709299702	2000	64	0	0	1	/uploads/models/2025/07/1752983036842_452159146_tower.glb	\N
\.


--
-- Data for Name: template_models; Type: TABLE DATA; Schema: public; Owner: dthubuser
--

COPY public.template_models (id, name, slug, description, url, thumbnail, "fileSize", "mimeType", dimensions, scale, "defaultHeight", "minimumPixelSize", "maximumScale", tags, "isPublic", "isApproved", metadata, "createdAt", "updatedAt", "userId", "modelTypeId", "categoryId") FROM stdin;
1	Cây Xà Cừ	cay-xa-cu	Cây xà cừ trưởng thành, cao 8-12m, phù hợp cho tạo bóng mát đường phố	/templates/trees/xa-cu.glb	/templates/trees/xa-cu.jpg	2048576	model/gltf-binary	{"depth": 8, "width": 8, "height": 12}	1	0	64	2000	{tree,shade,urban,vietnam}	t	t	{"climate": "tropical", "species": "Cassia fistula", "maintenance": "low", "seasonality": "flowering_season"}	2025-07-20 02:44:52.35	2025-07-20 02:44:52.35	1	14	\N
2	Cây Phượng Vĩ	cay-phuong-vi	Cây phượng vĩ với hoa đỏ rực, biểu tượng của mùa hè Hà Nội	/templates/trees/phuong-vi.glb	/templates/trees/phuong-vi.jpg	3145728	model/gltf-binary	{"depth": 15, "width": 15, "height": 18}	1	0	64	2000	{tree,flower,decorative,hanoi,summer}	t	t	{"species": "Delonix regia", "flowering_season": "May-August", "symbolic_meaning": "summer_hanoi"}	2025-07-20 02:44:52.353	2025-07-20 02:44:52.353	1	14	\N
3	Cây Dừa Kiểng	cay-dua-kieng	Cây dừa kiểng trang trí, phù hợp cho khu vực ven biển	/templates/trees/dua-kieng.glb	/templates/trees/dua-kieng.jpg	1572864	model/gltf-binary	{"depth": 6, "width": 6, "height": 10}	1	0	64	2000	{palm,tropical,coastal,decorative}	t	t	{"climate": "coastal_tropical", "species": "Cocos nucifera", "salt_tolerance": "high"}	2025-07-20 02:44:52.355	2025-07-20 02:44:52.355	1	14	\N
4	Cột Điện Trung Thế 22kV	cot-dien-22kv	Cột điện bê tông trung thế 22kV, chiều cao tiêu chuẩn 12m	/templates/infrastructure/cot-dien-22kv.glb	/templates/infrastructure/cot-dien-22kv.jpg	1024768	model/gltf-binary	{"depth": 0.5, "width": 0.5, "height": 12}	1	0	64	2000	{electricity,power,utility,22kv,concrete}	t	t	{"voltage": "22kV", "material": "concrete", "standard": "EVN_22kV", "load_capacity": "500kVA"}	2025-07-20 02:44:52.357	2025-07-20 02:44:52.357	1	10	\N
5	Trụ Đèn LED Đường Phố	tru-den-led	Trụ đèn LED chiếu sáng đường phố, tiết kiệm năng lượng	/templates/infrastructure/tru-den-led.glb	/templates/infrastructure/tru-den-led.jpg	512384	model/gltf-binary	{"depth": 0.3, "width": 0.3, "height": 8}	1	0	64	2000	{lighting,street,led,energy_efficient}	t	t	{"power": "120W_LED", "lumens": "15000lm", "lifetime": "50000_hours", "color_temperature": "4000K"}	2025-07-20 02:44:52.359	2025-07-20 02:44:52.359	1	12	\N
6	Biển Báo Cấm Đỗ Xe	bien-bao-cam-do-xe	Biển báo cấm đỗ xe tiêu chuẩn theo quy định giao thông	/templates/infrastructure/bien-bao-cam-do.glb	/templates/infrastructure/bien-bao-cam-do.jpg	256192	model/gltf-binary	{"depth": 0.1, "width": 0.6, "height": 2.5}	1	0	64	2000	{traffic,sign,regulation,parking,prohibition}	t	t	{"material": "aluminum_reflective", "standard": "QCVN_41_2019", "sign_code": "DP.135", "visibility": "day_night"}	2025-07-20 02:44:52.362	2025-07-20 02:44:52.362	1	11	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: dthubuser
--

COPY public.users (id, email, username, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt") FROM stdin;
1	congduy@gmail.com	admin	$2b$12$HPkeTIT3q/pCvIa2O89LRufgJTkLGTyZB7YJrPRvRdBAlotzLhNqS	DUY	Trinh	ADMIN	t	2025-07-20 02:41:42.417	2025-07-20 02:41:42.417
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dthubuser
--

SELECT pg_catalog.setval('public.categories_id_seq', 45, true);


--
-- Name: configs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dthubuser
--

SELECT pg_catalog.setval('public.configs_id_seq', 100, true);


--
-- Name: data_models_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dthubuser
--

SELECT pg_catalog.setval('public.data_models_id_seq', 2, true);


--
-- Name: file_uploads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dthubuser
--

SELECT pg_catalog.setval('public.file_uploads_id_seq', 8, true);


--
-- Name: geojsons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dthubuser
--

SELECT pg_catalog.setval('public.geojsons_id_seq', 16, true);


--
-- Name: infrastructure_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dthubuser
--

SELECT pg_catalog.setval('public.infrastructure_id_seq', 3, true);


--
-- Name: model_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dthubuser
--

SELECT pg_catalog.setval('public.model_types_id_seq', 17, true);


--
-- Name: models_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dthubuser
--

SELECT pg_catalog.setval('public.models_id_seq', 7, true);


--
-- Name: template_models_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dthubuser
--

SELECT pg_catalog.setval('public.template_models_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dthubuser
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: configs configs_pkey; Type: CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.configs
    ADD CONSTRAINT configs_pkey PRIMARY KEY (id);


--
-- Name: data_models data_models_pkey; Type: CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.data_models
    ADD CONSTRAINT data_models_pkey PRIMARY KEY (id);


--
-- Name: file_uploads file_uploads_pkey; Type: CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.file_uploads
    ADD CONSTRAINT file_uploads_pkey PRIMARY KEY (id);


--
-- Name: geojsons geojsons_pkey; Type: CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.geojsons
    ADD CONSTRAINT geojsons_pkey PRIMARY KEY (id);


--
-- Name: infrastructure infrastructure_pkey; Type: CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.infrastructure
    ADD CONSTRAINT infrastructure_pkey PRIMARY KEY (id);


--
-- Name: model_types model_types_pkey; Type: CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.model_types
    ADD CONSTRAINT model_types_pkey PRIMARY KEY (id);


--
-- Name: models models_pkey; Type: CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.models
    ADD CONSTRAINT models_pkey PRIMARY KEY (id);


--
-- Name: template_models template_models_pkey; Type: CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.template_models
    ADD CONSTRAINT template_models_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: dthubuser
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: dthubuser
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: configs_key_key; Type: INDEX; Schema: public; Owner: dthubuser
--

CREATE UNIQUE INDEX configs_key_key ON public.configs USING btree (key);


--
-- Name: model_types_name_key; Type: INDEX; Schema: public; Owner: dthubuser
--

CREATE UNIQUE INDEX model_types_name_key ON public.model_types USING btree (name);


--
-- Name: model_types_slug_key; Type: INDEX; Schema: public; Owner: dthubuser
--

CREATE UNIQUE INDEX model_types_slug_key ON public.model_types USING btree (slug);


--
-- Name: template_models_slug_key; Type: INDEX; Schema: public; Owner: dthubuser
--

CREATE UNIQUE INDEX template_models_slug_key ON public.template_models USING btree (slug);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: dthubuser
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: dthubuser
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: categories categories_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: data_models data_models_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.data_models
    ADD CONSTRAINT "data_models_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: data_models data_models_modelTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.data_models
    ADD CONSTRAINT "data_models_modelTypeId_fkey" FOREIGN KEY ("modelTypeId") REFERENCES public.model_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: data_models data_models_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.data_models
    ADD CONSTRAINT "data_models_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: file_uploads file_uploads_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.file_uploads
    ADD CONSTRAINT "file_uploads_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: geojsons geojsons_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.geojsons
    ADD CONSTRAINT "geojsons_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: geojsons geojsons_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.geojsons
    ADD CONSTRAINT "geojsons_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: infrastructure infrastructure_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.infrastructure
    ADD CONSTRAINT "infrastructure_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: infrastructure infrastructure_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.infrastructure
    ADD CONSTRAINT "infrastructure_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: model_types model_types_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.model_types
    ADD CONSTRAINT "model_types_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.model_types(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: models models_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.models
    ADD CONSTRAINT "models_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: models models_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.models
    ADD CONSTRAINT "models_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: template_models template_models_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.template_models
    ADD CONSTRAINT "template_models_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: template_models template_models_modelTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.template_models
    ADD CONSTRAINT "template_models_modelTypeId_fkey" FOREIGN KEY ("modelTypeId") REFERENCES public.model_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: template_models template_models_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dthubuser
--

ALTER TABLE ONLY public.template_models
    ADD CONSTRAINT "template_models_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: dthubuser
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

