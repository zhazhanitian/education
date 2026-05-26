declare namespace Api {
  namespace Cms {
    type MenuType = 'DIRECTORY' | 'PAGE'
    type ContentType = 'RICHTEXT' | 'FILE'

    interface NavMenu {
      id: number;
      name: string;
      type: MenuType;
      sortOrder: number;
      isVisible: boolean;
      parentId: number | null;
      children?: NavMenu[];
      pages?: Array<{ id: number }>;
    }

    interface NavMenuForm {
      name: string;
      type: MenuType;
      sortOrder: number;
      isVisible: boolean;
      parentId: number | null;
    }

    interface ContentPage {
      id: number;
      title: string;
      contentType: ContentType;
      richText?: string;
      isPublished: boolean;
      menuId: number;
      menu?: { id: number; name: string };
      files?: PageFile[];
      updatedAt: string;
    }

    interface ContentPageForm {
      title: string;
      contentType: ContentType;
      richText: string;
      isPublished: boolean;
      menuId: number | null;
      fileIds?: number[];
    }

    interface PageFile {
      id: number;
      fileName: string;
      originalName: string;
      mimeType: string;
      fileType: string;
      size: number;
      url: string;
    }

    interface NewsItem {
      id: number;
      title: string;
      summary?: string;
      content?: string;
      coverImage?: string;
      category?: string;
      isPublished: boolean;
      publishedAt?: string;
      viewCount: number;
      createdAt: string;
    }

    interface NewsForm {
      title: string;
      summary: string;
      content: string;
      category: string;
      isPublished: boolean;
      publishedAt?: string;
    }

    interface PageResult<T> {
      items: T[];
      total: number;
    }
  }

  namespace Config {
    interface HomeConfig {
      configs: Array<{ configKey: string; configValue: string }>;
      stats: HomeStat[];
    }

    interface HomeStat {
      id: number;
      label: string;
      value: string;
      icon: string;
      sortOrder: number;
      isVisible: boolean;
    }

    interface FileRecord {
      id: number;
      originalName: string;
      fileName: string;
      fileType: string;
      mimeType: string;
      size: number;
      url: string;
      createdAt: string;
    }

    interface FilePageResult {
      items: FileRecord[];
      total: number;
    }
  }
}
