const API_BASE =
  process.env.SITE_CONFIG_API_BASE?.trim().replace(/\/+$/, '') ||
  process.env.API_BASE_URL?.trim().replace(/\/+$/, '') ||
  'http://127.0.0.1:9527';

const MAIN_SITE_URL =
  process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim().replace(/\/+$/, '') ||
  process.env.MAIN_SITE_URL?.trim().replace(/\/+$/, '') ||
  'https://apks.cc';

type ApiEnvelope<T> = {
  code?: number;
  data?: T;
  message?: string;
};

export type CommunityComment = {
  id: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likeCount: number;
  replies: CommunityComment[];
  replyTotal: number;
  replyHasMore: boolean;
  replyPageSize: number;
};

export type CommunityCommentResult = {
  list: CommunityComment[];
  page: number;
  pageSize: number;
  total: number;
};

export type CommunityTopic = {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  followersCount: number;
  heatScore: number;
};

type ApiComment = {
  _id?: string;
  content?: string;
  created_at?: string;
  like_count?: number;
  replies?: ApiComment[];
  reply_has_more?: boolean;
  reply_page_size?: number;
  reply_to_user_name?: string;
  reply_total?: number;
  user_avatar?: string;
  user_name?: string;
};

type ApiTopic = {
  _id?: string;
  followers_count?: number;
  heat_score?: number;
  name?: string;
  post_count?: number;
  slug?: string;
};

function apiUrl(path: string) {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

function normalizeComment(input: ApiComment): CommunityComment {
  const replyTo = String(input.reply_to_user_name || '').trim();
  const content = String(input.content || '').trim();
  const text = replyTo ? `回复 @${replyTo}: ${content}` : content;
  const replies = Array.isArray(input.replies) ? input.replies.map(normalizeComment) : [];
  const replyTotal = Math.max(Number(input.reply_total || 0), replies.length);

  return {
    id: String(input._id || '').trim(),
    userName: String(input.user_name || '').trim() || '匿名用户',
    userAvatar: String(input.user_avatar || '').trim(),
    content: text,
    createdAt: String(input.created_at || '').trim(),
    likeCount: Math.max(0, Number(input.like_count || 0)),
    replies,
    replyTotal,
    replyHasMore:
      typeof input.reply_has_more === 'boolean'
        ? input.reply_has_more
        : replyTotal > replies.length,
    replyPageSize: Math.max(1, Number(input.reply_page_size || replies.length || 20)),
  };
}

function normalizeTopic(input: ApiTopic | null | undefined): CommunityTopic | null {
  const id = String(input?._id || '').trim();
  if (!id) {
    return null;
  }

  return {
    id,
    name: String(input?.name || '').trim() || '社区话题',
    slug: String(input?.slug || '').trim(),
    postCount: Math.max(0, Number(input?.post_count || 0)),
    followersCount: Math.max(0, Number(input?.followers_count || 0)),
    heatScore: Math.max(0, Number(input?.heat_score || 0)),
  };
}

async function readApiData<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const response = await fetch(apiUrl(path), {
      next: { revalidate },
    });
    if (!response.ok) {
      return null;
    }
    const json = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
    if (!json || json.code !== 0) {
      return null;
    }
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function getCommunityCommentThreads(
  postId: string,
  pageSize = 20,
): Promise<CommunityCommentResult> {
  const id = String(postId || '').trim();
  if (!id) {
    return { list: [], page: 1, pageSize, total: 0 };
  }

  const query = new URLSearchParams({
    page: '1',
    pageSize: String(pageSize),
    replyPageSize: '3',
    sort: 'latest',
  });
  const data = await readApiData<{
    list?: ApiComment[];
    page?: number;
    pageSize?: number;
    total?: number;
  }>(`/content/public/${encodeURIComponent(id)}/comments?${query.toString()}`, 30);

  return {
    list: Array.isArray(data?.list) ? data.list.map(normalizeComment) : [],
    page: Number(data?.page || 1),
    pageSize: Number(data?.pageSize || pageSize),
    total: Number(data?.total || 0),
  };
}

export async function getCommunityTopic(idOrSlug: string): Promise<CommunityTopic | null> {
  const value = String(idOrSlug || '').trim();
  if (!value) {
    return null;
  }

  const data = await readApiData<ApiTopic>(
    `/content/topics/public/${encodeURIComponent(value)}`,
    120,
  );
  return normalizeTopic(data);
}

export function buildMainSiteTopicUrl(topic?: CommunityTopic | null, fallbackTopicId = '') {
  const target = String(topic?.slug || topic?.id || fallbackTopicId || '').trim();
  if (!target) {
    return `${MAIN_SITE_URL}/community`;
  }
  return `${MAIN_SITE_URL}/community/topic/${encodeURIComponent(target)}`;
}

export function buildMainSitePostUrl(postId: string) {
  const id = String(postId || '').trim();
  return id ? `${MAIN_SITE_URL}/community/post/${encodeURIComponent(id)}` : `${MAIN_SITE_URL}/community`;
}
