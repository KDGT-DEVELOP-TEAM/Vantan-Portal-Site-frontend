// src/i18n/index.js
// Vue3 + vue-i18n (Option API / legacy) 前提の集約版
import { createI18n } from 'vue-i18n'

const messages = {
  ja: {
    common: {
      language: '日本語',
      logout: 'ログアウト',
      required: '(必須)',
      optional: '(任意)',
      home: 'ホーム',
      viewMore: 'View More',
      add: '追加',
      adding: '追加中...',
      cancel: 'キャンセル',
      submit: '登録する',
      submitting: '登録中...',
      update: '更新',
      updating: '更新中...',
      save: '更新を保存',
      back: '戻る',
      close: '閉じる',
      clear: 'クリア',
      ok: 'OK',
      ng: 'NG',
      download: 'ダウンロード',
      deleting: '削除中...',
      unavailable: '表示できません',
      unknownTitle: 'タイトル不明',
      unknownFile: 'ファイル名不明',
      unknownDate: '日付不明',
      unexpectedError: '予期しないエラーが発生しました。',
      unknownError: '不明なエラーが発生しました。',
      networkError: '通信エラーが発生しました',
      search: '検索',
      firstPage: '最初のページ',
      prevPage: '前のページ',
      nextPage: '次のページ',
      lastPage: '最後のページ',
      loading: '読み込み中...',
      setting: '設定中...',
      sending: '送信中...',
      footer: {
        copyright: '©VANTAN Inc.',
      },
      breadcrumb: {
        home: 'ホーム',
      },
      actions: {
        add: '追加',
      },
      status: {
        loadingCalendarUrl: 'カレンダーURLを読み込み中です...',
      },
    },

    // MobileMenu.vue: menuItems の labelKey に合わせる
    menu: {
      home: 'ホーム',
      news: 'お知らせ',
      calendar: 'カレンダー',
      timeschedules: '時間割リスト',
      files: 'ファイル',
      gallery: '在校生ギャラリー',
      users: 'ユーザー管理',
    },

    // 既存で nav.* を参照している場合もあるため残す（menu と同一値）
    nav: {
      home: 'ホーム',
      news: 'お知らせ',
      calendar: 'カレンダー',
      timeschedules: '時間割リスト',
      files: 'ファイル',
      gallery: '在校生ギャラリー',
      users: 'ユーザー管理',
    },

    errors: {
      forbidden: {
        message: 'このページにアクセスする権限がありません。',
        countdownPrefix: '{seconds}秒後に',
        countdownSuffix: 'に戻ります',
        backHome: 'ホームに戻る',
        backLogin: 'ログイン画面に戻る',
      },
      notFound: {
        message: 'このページは存在しません。',
        countdownPrefix: '{seconds}秒後に',
        countdownSuffix: 'に戻ります',
        backHome: 'ホームに戻る',
      },
    },

    modal: {
      addOptions: {
        addNews: 'お知らせ追加',
        addArticle: '記事追加',
        addTimeSchedule: '時間割追加',
      },
    },

    // AddOptionsModal.vue 用（modal.addOptions と別に使っているケースがあるため）
    addOptions: {
      news: 'お知らせ追加',
      gallery: '記事追加',
      timeschedule: '時間割追加',
    },

    home: {
      loading: '読み込み中',
      importantNews: {
        title: '重要なお知らせ',
        empty: '現在、重要なお知らせはありません。',
      },
      latestNews: {
        title: '新着情報',
        empty: '現在、新着情報はありません。',
      },
    },

    auth: {
      login: 'ログイン',
      loggingIn: 'ログイン中...',
      loginFailed: 'ログインに失敗しました',
      forgotPasswordPrefix: 'パスワードがわからない場合は',
      here: 'こちら',

      tokenNotFound: '認証トークンが見つかりません。',
      sessionExpired: 'セッションが切れました。再度ログインしてください。',

      emailSent: {
        title: 'メールを送信しました',
        description:
          'パスワード再設定用のURLを記載したメールを送信しました。\nメールボックスを確認し、記載されたURLをクリックしてパスワードの再設定を完了してください。',
        note: '※ メールが届かない場合は、迷惑メールフォルダもご確認ください。',
        backToLogin: 'ログイン画面に戻る',
      },

      forgot: {
        title: 'メール送信ページ',
        description:
          'ご登録のメールアドレスを入力してください。\n再設定用URLを記載したメールを送信します。',
        emailLabel: 'メールアドレス',
        emailPlaceholder: 'mail@example.com',
        submit: 'メールを送信する',
        backToLogin: 'ログイン画面に戻る',
        validation: {
          emailRequired: 'メールアドレスを入力してください。',
        },
        errors: {
          sendFailed: '送信中にエラーが発生しました',
        },
      },

      resetConfirm: {
        title: '新しいパスワード設定',
        prompt: '新しいパスワードを入力してください。',
        checkingLink: 'リンクを確認しています...',
        newPassword: '新しいパスワード',
        confirmPassword: '確認用パスワード',
        newPasswordPlaceholder:
          '8文字以上12文字以内で英数字記号全て含んで入力してください',
        confirmPasswordPlaceholder: 'もう一度同じパスワードを入力してください',
        submit: 'パスワードを設定する',
        toLogin: 'ログイン画面へ',
        countdownToLogin: '{seconds}秒後にログイン画面に戻ります。',
        success: 'パスワードが正常に設定されました。',
        errors: {
          missingParams: 'パスワード再設定に必要な情報が不足しています。',
          invalidOrExpired: 'このリンクは無効、または有効期限が切れています。',
          tooShort: 'パスワードは8文字以上で入力してください。',
          tooLong: 'パスワードは12文字以内で入力してください。',
          notMatch: 'パスワードが一致しません。',
          invalidRequest: '無効なリクエストです。',
          failed: 'パスワード設定中にエラーが発生しました。',
        },
      },
    },

    login: {
      title: 'ログイン',
      submit: 'ログイン',
      email: {
        label: 'メールアドレス',
        placeholder: 'mail@example.com',
      },
      password: {
        label: 'パスワード',
        placeholder: 'パスワードを入力',
        hint: '8〜12文字、英字/数字/記号を含めてください',
      },
    },

    user: {
      role: {
        viewer: '保護者',
        admin: '管理者',
      },

      add: {
        title: 'ユーザー追加',
        submit: 'ユーザーを登録',
        bulkRegister: '一括登録',
        created: 'ユーザー（{email}）が正常に登録されました。',
        bulkRegistered: 'ユーザーが一括登録されました。',
        errors: {
          invalidInput: '入力内容にエラーがあります。確認してください。',
          forbidden:
            'ユーザーを作成する権限がありません。管理者にお問い合わせください。',
          server: '通信エラーまたはサーバーエラーが発生しました。',
        },
        roleSection: {
          label: '権限区分',
          viewer: '保護者',
          admin: '管理者',
          helper: '※ 権限の付与・制御はサーバー側（DRF）で行われます。',
        },
        form: {
          emailLabel: 'メールアドレス',
          emailPlaceholder: 'test@example.com',
          nameLabel: '名前',
          namePlaceholder: '例: 山田 太郎',
          confirmPasswordLabel: 'パスワード確認',
          confirmPasswordPlaceholder: 'もう一度パスワードを入力',
        },
      },

      bulk: {
        title: 'ユーザー一括登録',
        tabs: {
          generate: '連番で作成',
          csv: 'CSVから作成',
        },
        errors: {
          registerFailed: 'ユーザー登録に失敗しました',
        },
        generate: {
          countLabel: '作成するユーザー数',
          emailLabel: 'メールアドレス',
          roleLabel: '権限',
          preview: '{base}{start}〜{count}@{domain}',
        },
        csv: {
          fileLabel: 'CSVファイル',
          pickFile: 'ファイル選択',
          noFileSelected: 'ファイルが選択されていません',
          formatTitle: 'CSVフォーマット（ヘッダ必須）',
          headerExample: 'email,user_name,permission',
          permissionHint: 'permission：viewer / admin',
          encodingNote: '※ UTF-8（BOM付き推奨）のCSVを使用してください。',
          previewSummary: '登録可能 {valid} / {total}',
          status: '状態',
          errors: {
            empty: 'CSVが空です',
            invalidHeader:
              'CSVヘッダが不正です（email,user_name,permission が必要です）',
            noValidRows: '登録可能な行がありません',
            emailEmpty: 'emailが空です',
            emailInvalid: 'email形式が不正です',
            permissionInvalid: '権限が不正です',
          },
        },
      },

      edit: {
        titleWithEmail: 'ユーザー情報編集 ({email})',
        roleLabel: 'ロール',
      },
      roles: {
        viewer: '保護者',
        admin: '管理者',
      },
      status: {
        active: '有効',
        inactive: '無効',
      },
      actions: {
        edit: '編集',
        editTooltip: 'ユーザー情報を編集',
        delete: '削除',
        enable: '有効化',
        disable: '無効化',
        enabled: '有効化',
        disabled: '無効化',
      },

      list: {
        title: 'ユーザーリスト',
        searchPlaceholder: 'キーワードで検索',
        loading: 'ユーザー一覧を読み込み中です...',
        fetchFailed: 'ユーザー一覧の取得に失敗しました',
        emptyBySearch: '検索条件に一致するユーザーが見つかりません。',
        emptyAll: '登録されているユーザーはいません。',
        openAddMenu: '追加メニューを開く',

        // notify
        notifyStatusChanged: 'ユーザーを{action}しました',
        notifyStatusChangeFailed: '変更に失敗しました: {detail}',
        notifyDeleted: '削除しました',
        notifyDeleteFailed: '削除に失敗しました',
        notifyCreatedRefresh:
          '新規ユーザーが登録されました。リストを更新します。',
        notifyOptionSelected:
          '管理者機能「{option}」が選択されました。該当ページに遷移します。',

        // UserScrollBar 側でも使用
        confirmDelete: '本当に削除しますか？',
        columns: {
          email: 'メールアドレス',
          role: '権限',
          status: '有効/無効',
          createdAt: '作成日',
          actions: '操作',
        },
      },
    },

    timeschedule: {
      grade: '学年',
      gradeSuffix: '年生',
      title: 'タイトル',
      titlePlaceholder: 'タイトルを入力してください',
      attachment: '添付ファイル',
      noPermission: '権限がありません。操作できません。',
      requiredMissing: '必須項目が未入力です。',
      createFailed: '時間割の作成中にエラーが発生しました。',

      add: {
        title: '時間割追加',
      },

      filter: {
        gradeLabel: '学年 :',
        all: '全て',
        gradeSuffix: '年生',
      },

      item: {
        noFile: '画像/ファイルなし',
        uploaded: 'アップロード:',
        gradeSuffix: '年生',
        gradeUnknown: '学年不明',
        imageAlt: '時間割画像',
        downloadTitle: '画像/ファイルをダウンロード',
      },

      list: {
        title: '時間割リスト',
        loading: 'データを読み込み中です...',
        empty: '該当する時間割はありません。',
        fetchFailed: '時間割の取得に失敗しました',
        confirmDelete: 'この時間割を削除してもよろしいですか？',
        deleteFailed: '削除中にエラーが発生しました。',
      },

      detail: {
        loading: '詳細データを読み込み中です...',
        fetchFailed: '詳細データの取得に失敗しました',
        apiError: '詳細データの取得に失敗しました。',
        noFile: '時間割ファイルは添付されていません。',
        alt: '時間割',
        openInNewTab: 'ファイルを新しいタブで表示',
        downloadFailed: 'ファイルのダウンロード中にエラーが発生しました。',
        gradeLabel: '{grade}年生',
        unknownGrade: '学年不明',
      },
    },

    file: {
      select: 'ファイル選択',
      notSelected: 'ファイルが選択されていません',
      deleteAria: 'ファイルを削除',
      deleteTitle: '選択したファイルを削除',
      helpPdfMax: 'PDFファイルのみ (最大{max}MB)',
      errorOnlyPdf: 'PDFファイルのみ選択できます。',
      errorTooLarge: 'ファイルサイズが大きすぎます（最大{max}MB）。',
    },

    fileList: {
      title: 'ファイルリスト',
      searchPlaceholder: 'キーワードで検索',
      searchAriaLabel: '検索',
      fetchFailed: 'ファイル一覧の取得に失敗しました: {detail}',
      loading: 'ファイルを読み込み中です...',
      emptyMatched: 'キーワード「{query}」に一致するファイルは見つかりませんでした。',
      emptyNoFiles: '現在、ファイルはありません。',
      deleteConfirm: '本当にこのファイルを削除してもよろしいですか？',
      noDeletePermission: 'ファイルの削除権限がありません。',
      deleteSuccess: 'ファイルを削除しました。',
      deleteFailed: 'ファイルの削除に失敗しました。詳細: {detail}',
      openAdminMenu: '管理者メニューを開く',
    },

    fileItem: {
      fileType: 'ファイル形式',
      publishedAt: '公開日',
      previewAlt: '{title}のプレビュー',
      download: 'ダウンロード',
      delete: 'ファイルを削除',
      unknown: '不明',
      unknownDate: '日付不明',
    },

    fileDetail: {
      loading: '詳細データを読み込み中です...',
      fetchFailed: '詳細データの取得に失敗しました: {detail}',
      previewOpenNewTab: 'ファイルを新しいタブで表示',
      download: 'ダウンロード',
      delete: '削除',
      fileNotAttached: 'ファイルは添付されていません。',
      imageLoadFailed: '画像の表示に失敗しました',
      fileType: 'ファイル形式',
      createdAt: '作成日',
      unknownDate: '日付不明',
      tokenNotFound: '認証トークンが見つかりません。',
      downloadFailed: 'ファイルのダウンロード中にエラーが発生しました。',
      deleteConfirm: '本当にファイル「{title}」を削除してもよろしいですか？',
    },

    pages: {
      calendar: {
        title: 'カレンダー',
        iframeTitle: 'スケジュールカレンダー',
        errorPrefix: 'カレンダーURLの取得に失敗しました: ',
        errorFetchPrefix: 'カレンダーURLの取得に失敗しました:',
        loading: 'カレンダーURLを読み込み中です...',
        empty: 'カレンダーのURLが設定されていません。',
        apiMissingUrl: 'APIレスポンスにカレンダーURLが含まれていません。',
        apiFailed:
          'カレンダーURLの取得に失敗しました。認証状態を確認してください。',
      },

      // forgotPassword を pages 配下で使っている場合の互換（auth.forgot と同値を用意）
      forgotPassword: {
        title: 'メール送信ページ',
        descriptionLine1: 'ご登録のメールアドレスを入力してください。',
        descriptionLine2: '再設定用URLを記載したメールを送信します。',
        emailLabel: 'メールアドレス',
        required: '(必須)',
        emailPlaceholder: 'example@example.com',
        sending: '送信中...',
        sendButton: 'メールを送信する',
        backToLogin: '< ログイン画面に戻る',
        validationEmailRequired: 'メールアドレスを入力してください。',
        errorGeneric: '送信中にエラーが発生しました',
      },
    },

    page: {
      home: 'ホーム',
    },

    breadcrumb: {
      gallery: 'ギャラリー',
      detail: '詳細',
    },

    gallery: {
      create: {
        title: 'ギャラリー新規投稿',
      },
      edit: {
        title: 'ギャラリー編集',
      },
      list: {
        title: 'ギャラリー',
        searchPlaceholder: 'キーワードで検索',
        noResults: '該当するギャラリーはありません。',
      },
      form: {
        titleLabel: 'タイトル',
        titlePlaceholder: 'タイトルを入力してください',
        contentLabel: '本文',
        contentPlaceholder: '本文を入力してください',
        currentImages: '現在の画像',
        delete: '削除',
        addImages: '画像を追加',
        imagesMultiple: '画像 (複数選択可)',
        submitCreate: '投稿',
        submitUpdate: '更新',
        previewTitle: 'プレビュー',
      },
      attachments: '添付ファイル',
      backToList: 'ギャラリー一覧へ戻る',
      editAction: '編集',
      deleteAction: '削除',
      preview: {
        attachments: '添付ファイル',
        unavailable: 'プレビュー利用不可',
        empty: 'プレビューする内容がありません。',
      },
    },

    pdfThumbnail: {
      loading: 'PDFを読み込み中...',
      renderFailed: '描画失敗',
    },

    news: {
      addForm: {
        headline: '見出し (タイトル)',
        titlePlaceholder: 'タイトルを入力してください',
        content: '内容',
        contentPlaceholder: '内容を入力してください',
        important: '重要なお知らせ',
        attachments: '添付ファイル',
        chooseFile: 'ファイル選択',
        maxFilesHint: '※ 最大{max}件まで添付可能',
        submit: '追加',
        validationRequiredTitleContent: '見出し(タイトル)と本文は必須項目です。',
        fileTooLarge: '{name} のサイズが大きすぎます（最大{maxMb}MB）。',
        tooManyFiles: '添付ファイルは最大{max}件までです。',
      },

      searchPlaceholder: 'タイトルを検索',
      filterImportantOnly: '重要なお知らせのみ',
      noResults: '該当するお知らせはありません。',
      confirmDelete: 'このお知らせを削除しますか？',

      create: {
        title: 'お知らせの新規作成',
        breadcrumb: {
          news: 'お知らせ',
          create: '新規作成',
        },
        success: 'お知らせの作成に成功しました。',
        failed: 'お知らせの作成に失敗しました。',
      },

      editForm: {
        loading: 'お知らせ情報を読み込み中...',
        markImportant: '重要なお知らせとしてマークする',
        attachments: '添付ファイル',
        removeFile: 'このファイルを削除',
        fetchFailed: '編集のためのお知らせ情報の取得に失敗しました。',
        validationTitleRequired: 'タイトルは必須です。',
        validationContentRequired: '本文は必須です。',
        validationFix: '入力内容にエラーがあります。確認してください。',
        updateSuccess: 'お知らせが正常に更新されました。',
        updateBadRequest: '入力内容を修正してください。',
        updateFailed: 'お知らせの更新に失敗しました: {detail}',
      },

      editScreen: {
        title: 'お知らせの編集',
        breadcrumb: {
          news: 'お知らせ',
          edit: '編集',
          idFallback: 'お知らせID:{id}',
        },
      },

      form: {
        title: {
          label: 'タイトル',
          placeholder: 'お知らせのタイトルを入力してください',
          requiredError: 'タイトルは必須項目です。',
        },
        content: {
          label: '本文',
          placeholder:
            'お知らせの本文をMarkdownまたはプレーンテキストで入力してください',
          requiredError: '本文は必須項目です。',
        },
        thumbnail: {
          label: 'メインサムネイル画像',
          previewAlt: '画像プレビュー',
          select: '画像を選択 (クリックまたはドラッグ&ドロップ)',
          help: 'JPG, PNGなどの画像ファイルをアップロードしてください。',
        },
        subThumbnail: {
          label: 'サブサムネイル画像',
          select: 'サブ画像を選択',
          previewAlt: 'サブ画像プレビュー',
          help: 'メイン画像とは別に、詳細画面に表示する小さな画像をアップロードできます。',
        },
        url: {
          label: '関連URL',
          placeholder: 'https://example.com/related-info',
          help: '関連するウェブサイトのURLをフルパスで入力してください。',
          invalidError: '有効なURL形式で入力してください。',
        },
      },

      confirm: {
        cancel:
          '編集中の内容は保存されません。本当にキャンセルしますか？',
      },

      preview: {
        important: '重要',
        noPreview: 'プレビュー利用不可',
        attachments: '添付ファイル',
        openFile: 'ファイルを開く',
        empty: 'プレビューする内容がありません。',
        mainAlt: 'お知らせ画像プレビュー',
        attachmentAlt: '添付画像プレビュー {n}',
      },

      pdfThumbnail: {
        loading: 'PDFを読み込み中...',
        renderFailed: '描画失敗',
      },
    },

    newsList: {
      badge: {
        important: '重要',
      },
      thumbnail: {
        noImage: 'NO IMAGE',
      },
    },

    newsDetail: {
      pageTitle: 'お知らせ詳細',
      loading: 'お知らせを読み込み中...',
      attachmentsTitle: '添付ファイル',
      backToList: 'お知らせ一覧へ戻る',
      mainPreviewAlt: 'お知らせ画像',
      fileN: 'ファイル{n}',
    },

    pagesLabel: {
      home: 'ホーム',
      news: 'お知らせ',
    },
    breadcrumbs: {
      home: 'ホーム',
      news: 'お知らせ',
    },
  },

  en: {
    common: {
      language: 'English',
      logout: 'Logout',
      required: '(Required)',
      optional: '(Optional)',
      home: 'Home',
      viewMore: 'View More',
      add: 'Add',
      adding: 'Adding...',
      cancel: 'Cancel',
      submit: 'Register',
      submitting: 'Registering...',
      update: 'Update',
      updating: 'Updating...',
      save: 'Save changes',
      back: 'Back',
      close: 'Close',
      clear: 'Clear',
      ok: 'OK',
      ng: 'NG',
      download: 'Download',
      deleting: 'Deleting...',
      unavailable: 'Cannot display',
      unknownTitle: 'Unknown title',
      unknownFile: 'Unknown filename',
      unknownDate: 'Unknown date',
      unexpectedError: 'An unexpected error occurred.',
      unknownError: 'An unknown error occurred.',
      networkError: 'A network error occurred',
      search: 'Search',
      firstPage: 'First page',
      prevPage: 'Previous page',
      nextPage: 'Next page',
      lastPage: 'Last page',
      loading: 'Loading...',
      setting: 'Setting...',
      sending: 'Sending...',
      footer: {
        copyright: '©VANTAN Inc.',
      },
      breadcrumb: {
        home: 'Home',
      },
      actions: {
        add: 'Add',
      },
      status: {
        loadingCalendarUrl: 'Loading calendar URL...',
      },
    },

    menu: {
      home: 'Home',
      news: 'News',
      calendar: 'Calendar',
      timeschedules: 'Timetable',
      files: 'Files',
      gallery: 'Student Gallery',
      users: 'User Management',
    },

    nav: {
      home: 'Home',
      news: 'News',
      calendar: 'Calendar',
      timeschedules: 'Timetable',
      files: 'Files',
      gallery: 'Gallery',
      users: 'Users',
    },

    errors: {
      forbidden: {
        message: 'You do not have permission to access this page.',
        countdownPrefix: 'Redirecting in {seconds}s to',
        countdownSuffix: '.',
        backHome: 'Back to Home',
        backLogin: 'Back to Login',
      },
    },

    modal: {
      addOptions: {
        addNews: 'Add news',
        addArticle: 'Add article',
        addTimeSchedule: 'Add timetable',
      },
    },

    addOptions: {
      news: 'Add news',
      gallery: 'Add article',
      timeschedule: 'Add timetable',
    },

    home: {
      importantNews: {
        title: 'Important Notices',
        empty: 'There are no important notices at the moment.',
      },
      latestNews: {
        title: 'Latest News',
        empty: 'There is no latest news at the moment.',
      },
    },

    auth: {
      login: 'Login',
      loggingIn: 'Logging in...',
      loginFailed: 'Login failed',
      forgotPasswordPrefix: 'Forgot your password?',
      here: 'Here',

      tokenNotFound: 'Authentication token not found.',
      sessionExpired: 'Your session has expired. Please log in again.',

      emailSent: {
        title: 'Email sent',
        description:
          'We sent you an email with a password reset link.\nPlease check your inbox and open the link to complete the reset.',
        note: 'If you can’t find the email, please check your spam folder as well.',
        backToLogin: 'Back to login',
      },

      forgot: {
        title: 'Send reset email',
        description:
          'Enter your registered email address.\nWe will send you a password reset link.',
        emailLabel: 'Email',
        emailPlaceholder: 'mail@example.com',
        submit: 'Send email',
        backToLogin: 'Back to login',
        validation: {
          emailRequired: 'Please enter your email address.',
        },
        errors: {
          sendFailed: 'An error occurred while sending.',
        },
      },

      resetConfirm: {
        title: 'Set a new password',
        prompt: 'Please enter a new password.',
        checkingLink: 'Checking the link...',
        newPassword: 'New password',
        confirmPassword: 'Confirm password',
        newPasswordPlaceholder:
          '8–12 characters, include letters, numbers, and symbols',
        confirmPasswordPlaceholder: 'Enter the same password again',
        submit: 'Set password',
        toLogin: 'Go to login',
        countdownToLogin: 'Redirecting to login in {seconds}s.',
        success: 'Your password has been updated.',
        errors: {
          missingParams: 'Missing required information for password reset.',
          invalidOrExpired: 'This link is invalid or has expired.',
          tooShort: 'Password must be at least 8 characters.',
          tooLong: 'Password must be 12 characters or fewer.',
          notMatch: 'Passwords do not match.',
          invalidRequest: 'Invalid request.',
          failed: 'An error occurred while updating your password.',
        },
      },
    },

    login: {
      title: 'Log in',
      submit: 'Log in',
      email: {
        label: 'Email',
        placeholder: 'mail@example.com',
      },
      password: {
        label: 'Password',
        placeholder: 'Enter your password',
        hint: '8–12 chars, include letters, numbers, and symbols',
      },
    },

    user: {
      role: {
        viewer: 'Guardian',
        admin: 'Admin',
      },

      add: {
        title: 'Add User',
        submit: 'Create user',
        bulkRegister: 'Bulk register',
        created: 'User ({email}) was created successfully.',
        bulkRegistered: 'Users were registered in bulk.',
        errors: {
          invalidInput: 'There are errors in your input. Please check and try again.',
          forbidden:
            'You do not have permission to create users. Please contact an administrator.',
          server: 'A network or server error occurred.',
        },
        roleSection: {
          label: 'Role',
          viewer: 'Guardian',
          admin: 'Admin',
          helper: '* Role assignment/authorization is handled on the server (DRF).',
        },
        form: {
          emailLabel: 'Email',
          emailPlaceholder: 'test@example.com',
          nameLabel: 'Name',
          namePlaceholder: 'e.g., Taro Yamada',
          confirmPasswordLabel: 'Confirm password',
          confirmPasswordPlaceholder: 'Enter your password again',
        },
      },

      bulk: {
        title: 'Bulk User Registration',
        tabs: {
          generate: 'Create sequentially',
          csv: 'Upload CSV',
        },
        errors: {
          registerFailed: 'Failed to register users',
        },
        generate: {
          countLabel: 'Number of users to create',
          emailLabel: 'Email address',
          roleLabel: 'Role',
          preview: '{base}{start}–{count}@{domain}',
        },
        csv: {
          fileLabel: 'CSV file',
          pickFile: 'Choose file',
          noFileSelected: 'No file selected',
          formatTitle: 'CSV format (header required)',
          headerExample: 'email,user_name,permission',
          permissionHint: 'permission: viewer / admin',
          encodingNote: '* Please use UTF-8 (BOM recommended).',
          previewSummary: 'Valid {valid} / {total}',
          status: 'Status',
          errors: {
            empty: 'CSV is empty',
            invalidHeader: 'Invalid CSV header (required: email,user_name,permission)',
            noValidRows: 'No valid rows to register',
            emailEmpty: 'Email is empty',
            emailInvalid: 'Invalid email format',
            permissionInvalid: 'Invalid permission',
          },
        },
      },

      edit: {
        titleWithEmail: 'Edit user ({email})',
        roleLabel: 'Role',
      },
      roles: {
        viewer: 'Viewer',
        admin: 'Admin',
      },
      status: {
        active: 'Active',
        inactive: 'Inactive',
      },
      actions: {
        edit: 'Edit',
        editTooltip: 'Edit user information',
        delete: 'Delete',
        enable: 'Enable',
        disable: 'Disable',
        enabled: 'enabled',
        disabled: 'disabled',
      },

      list: {
        title: 'User List',
        searchPlaceholder: 'Search by keyword',
        loading: 'Loading users...',
        fetchFailed: 'Failed to fetch users',
        emptyBySearch: 'No users match your search.',
        emptyAll: 'No users registered.',
        openAddMenu: 'Open add menu',

        notifyStatusChanged: 'User {action}.',
        notifyStatusChangeFailed: 'Failed to change: {detail}',
        notifyDeleted: 'Deleted.',
        notifyDeleteFailed: 'Delete failed.',
        notifyCreatedRefresh: 'A new user was created. Refreshing the list.',
        notifyOptionSelected: 'Admin option "{option}" was selected. Navigating...',

        confirmDelete: 'Are you sure you want to delete?',
        columns: {
          email: 'Email',
          role: 'Role',
          status: 'Status',
          createdAt: 'Created',
          actions: 'Actions',
        },
      },
    },

    timeschedule: {
      grade: 'Grade',
      gradeSuffix: '',
      title: 'Title',
      titlePlaceholder: 'Enter a title',
      attachment: 'Attachment',
      noPermission: 'You do not have permission.',
      requiredMissing: 'Required fields are missing.',
      createFailed: 'Failed to create timetable.',

      add: {
        title: 'Add Timetable',
      },

      filter: {
        gradeLabel: 'Grade:',
        all: 'All',
        gradeSuffix: '',
      },

      item: {
        noFile: 'No file',
        uploaded: 'Uploaded:',
        gradeSuffix: '',
        gradeUnknown: 'Unknown grade',
        imageAlt: 'Timetable image',
        downloadTitle: 'Download file',
      },

      list: {
        title: 'Timetable List',
        loading: 'Loading...',
        empty: 'No timetable found.',
        fetchFailed: 'Failed to fetch timetables.',
        confirmDelete: 'Are you sure you want to delete this timetable?',
        deleteFailed: 'Failed to delete.',
      },

      detail: {
        loading: 'Loading detail...',
        fetchFailed: 'Failed to fetch detail',
        apiError: 'Failed to fetch detail.',
        noFile: 'No timetable file attached.',
        alt: 'Timetable',
        openInNewTab: 'Open in a new tab',
        downloadFailed: 'An error occurred while downloading.',
        gradeLabel: 'Grade {grade}',
        unknownGrade: 'Unknown grade',
      },
    },

    file: {
      select: 'Select file',
      notSelected: 'No file selected',
      deleteAria: 'Delete file',
      deleteTitle: 'Delete selected file',
      helpPdfMax: 'PDF only (max {max}MB)',
      errorOnlyPdf: 'Only PDF files are allowed.',
      errorTooLarge: 'File is too large (max {max}MB).',
    },

    fileList: {
      title: 'File List',
      searchPlaceholder: 'Search by keyword',
      searchAriaLabel: 'Search',
      fetchFailed: 'Failed to fetch files: {detail}',
      loading: 'Loading files...',
      emptyMatched: 'No files matched "{query}".',
      emptyNoFiles: 'No files available.',
      deleteConfirm: 'Are you sure you want to delete this file?',
      noDeletePermission: 'You do not have permission to delete files.',
      deleteSuccess: 'File deleted.',
      deleteFailed: 'Failed to delete file. Detail: {detail}',
      openAdminMenu: 'Open admin menu',
    },

    fileItem: {
      fileType: 'File type',
      publishedAt: 'Published',
      previewAlt: 'Preview of {title}',
      download: 'Download',
      delete: 'Delete file',
      unknown: 'Unknown',
      unknownDate: 'Unknown date',
    },

    fileDetail: {
      loading: 'Loading detail...',
      fetchFailed: 'Failed to fetch detail: {detail}',
      previewOpenNewTab: 'Open file in a new tab',
      download: 'Download',
      delete: 'Delete',
      fileNotAttached: 'No file attached.',
      imageLoadFailed: 'Failed to display image',
      fileType: 'File type',
      createdAt: 'Created',
      unknownDate: 'Unknown date',
      tokenNotFound: 'Authentication token not found.',
      downloadFailed: 'An error occurred while downloading.',
      deleteConfirm: 'Are you sure you want to delete "{title}"?',
    },

    pages: {
      calendar: {
        title: 'Calendar',
        iframeTitle: 'Schedule Calendar',
        errorPrefix: 'Failed to fetch calendar URL: ',
        errorFetchPrefix: 'Failed to fetch calendar URL:',
        loading: 'Loading calendar URL...',
        empty: 'Calendar URL is not configured.',
        apiMissingUrl: 'Calendar URL is missing in the API response.',
        apiFailed:
          'An error occurred while fetching the URL. If authentication is required, please check the Google Calendar settings.',
      },
      forgotPassword: {
        title: 'Send Email',
        descriptionLine1: 'Please enter your registered email address.',
        descriptionLine2: 'We will send you a reset link.',
        emailLabel: 'Email address',
        required: '(Required)',
        emailPlaceholder: 'example@example.com',
        sending: 'Sending...',
        sendButton: 'Send email',
        backToLogin: '< Back to login',
        validationEmailRequired: 'Please enter your email address.',
        errorGeneric: 'An error occurred while sending.',
      },
    },

    page: {
      home: 'Home',
    },

    breadcrumb: {
      gallery: 'Gallery',
      detail: 'Detail',
    },

    gallery: {
      create: {
        title: 'Create Gallery Post',
      },
      edit: {
        title: 'Edit Gallery Post',
      },
      list: {
        title: 'Gallery',
        searchPlaceholder: 'Search by keyword',
        noResults: 'No galleries found.',
      },
      form: {
        titleLabel: 'Title',
        titlePlaceholder: 'Enter a title',
        contentLabel: 'Content',
        contentPlaceholder: 'Enter content',
        currentImages: 'Current files',
        delete: 'Delete',
        addImages: 'Add files',
        imagesMultiple: 'Files (multiple allowed)',
        submitCreate: 'Post',
        submitUpdate: 'Update',
        previewTitle: 'Preview',
      },
      attachments: 'Attachments',
      backToList: 'Back to gallery list',
      editAction: 'Edit',
      deleteAction: 'Delete',
      preview: {
        attachments: 'Attachments',
        unavailable: 'Preview not available',
        empty: 'Nothing to preview.',
      },
    },

    pdfThumbnail: {
      loading: 'Loading PDF...',
      renderFailed: 'Render failed',
    },

    news: {
      addForm: {
        headline: 'Headline (Title)',
        titlePlaceholder: 'Enter a title',
        content: 'Content',
        contentPlaceholder: 'Enter content',
        important: 'Important notice',
        attachments: 'Attachments',
        chooseFile: 'Choose file',
        maxFilesHint: '* Up to {max} files',
        submit: 'Add',
        validationRequiredTitleContent: 'Title and content are required.',
        fileTooLarge: '{name} is too large (max {maxMb}MB).',
        tooManyFiles: 'You can attach up to {max} files.',
      },

      searchPlaceholder: 'Search titles',
      filterImportantOnly: 'Important only',
      noResults: 'No news found.',
      confirmDelete: 'Delete this news?',

      create: {
        title: 'Create News',
        breadcrumb: {
          news: 'News',
          create: 'Create',
        },
        success: 'News was created successfully.',
        failed: 'Failed to create news.',
      },

      editForm: {
        loading: 'Loading news...',
        markImportant: 'Mark as important',
        attachments: 'Attachments',
        removeFile: 'Remove this file',
        fetchFailed: 'Failed to fetch news for editing.',
        validationTitleRequired: 'Title is required.',
        validationContentRequired: 'Content is required.',
        validationFix: 'Please fix the errors in your input.',
        updateSuccess: 'News was updated successfully.',
        updateBadRequest: 'Please correct your input.',
        updateFailed: 'Failed to update news: {detail}',
      },

      editScreen: {
        title: 'Edit News',
        breadcrumb: {
          news: 'News',
          edit: 'Edit',
          idFallback: 'News ID:{id}',
        },
      },

      form: {
        title: {
          label: 'Title',
          placeholder: 'Enter a title',
          requiredError: 'Title is required.',
        },
        content: {
          label: 'Content',
          placeholder: 'Enter the news content in Markdown or plain text',
          requiredError: 'Content is required.',
        },
        thumbnail: {
          label: 'Main thumbnail image',
          previewAlt: 'Image preview',
          select: 'Select image (click or drag & drop)',
          help: 'Upload an image file such as JPG or PNG.',
        },
        subThumbnail: {
          label: 'Sub thumbnail image',
          select: 'Select sub image',
          previewAlt: 'Sub image preview',
          help: 'You can upload a small image for the detail page.',
        },
        url: {
          label: 'Related URL',
          placeholder: 'https://example.com/related-info',
          help: 'Enter the full URL of a related website.',
          invalidError: 'Please enter a valid URL.',
        },
      },

      confirm: {
        cancel: 'Edits will not be saved. Cancel anyway?',
      },

      preview: {
        important: 'Important',
        noPreview: 'Preview not available',
        attachments: 'Attachments',
        openFile: 'Open file',
        empty: 'Nothing to preview.',
        mainAlt: 'News image preview',
        attachmentAlt: 'Attachment preview {n}',
      },

      pdfThumbnail: {
        loading: 'Loading PDF...',
        renderFailed: 'Render failed',
      },
    },

    newsList: {
      badge: {
        important: 'Important',
      },
      thumbnail: {
        noImage: 'NO IMAGE',
      },
    },

    newsDetail: {
      pageTitle: 'News Detail',
      loading: 'Loading news...',
      attachmentsTitle: 'Attachments',
      backToList: 'Back to news list',
      mainPreviewAlt: 'News image',
      fileN: 'File {n}',
    },

    pagesLabel: {
      home: 'Home',
      news: 'News',
    },
    breadcrumbs: {
      home: 'Home',
      news: 'News',
    },
  },

  // zh/ko は「未実装は ja fallback でOK」方針なので、
  // まずは最低限 (viewMore / menu / modal.addOptions / home tabs) だけ埋める
  zh: {
    common: {
      language: '中文',
      logout: '退出登录',
      required: '(必填)',
      optional: '(非必填)',
      home: '首页',
      viewMore: '查看更多',
      add: '添加',
      cancel: '取消',
      submit: '提交',
      back: '返回',
      close: '关闭',
      loading: '加载中...',
      footer: { copyright: '©VANTAN Inc.' },
    },
    menu: {
      home: '首页',
      news: '公告',
      calendar: '日历',
      timeschedules: '课程表',
      files: '文件',
      gallery: '学生画廊',
      users: '用户管理',
    },
    nav: {
      home: '首页',
      news: '公告',
      calendar: '日历',
      timeschedules: '课程表',
      files: '文件',
      gallery: '学生画廊',
      users: '用户管理',
    },
    modal: {
      addOptions: {
        addNews: '新增公告',
        addArticle: '新增文章',
        addTimeSchedule: '新增课程表',
      },
    },
    home: {
      importantNews: {
        title: '重要通知',
        empty: '目前没有重要通知。',
      },
      latestNews: {
        title: '最新消息',
        empty: '目前没有最新消息。',
      },
    },
    timeschedule: {
      grade: '年级',
      gradeSuffix: '年级',
      title: '标题',
      titlePlaceholder: '请输入标题',
      attachment: '附件',
      noPermission: '没有权限。无法进行操作。',
      requiredMissing: '必填项目未填写。',
      createFailed: '创建课程表时发生错误。',

      add: {
        title: '添加课程表',
      },

      filter: {
        gradeLabel: '年级 :',
        all: '全部',
        gradeSuffix: '年级',
      },

      item: {
        noFile: '无图片/文件',
        uploaded: '上传日期:',
        gradeSuffix: '年级',
        gradeUnknown: '年级不明',
        imageAlt: '课程表图片',
        downloadTitle: '下载图片/文件',
      },

      list: {
        title: '课程表列表',
        loading: '正在加载数据...',
        empty: '没有相关的课程表。',
        fetchFailed: '获取课程表失败',
        confirmDelete: '确定要删除这个课程表吗？',
        deleteFailed: '删除时发生错误。',
      },

      detail: {
        loading: '正在加载详情数据...',
        fetchFailed: '获取详情数据失败',
        apiError: '获取详情数据失败。',
        noFile: '未添加课程表文件。',
        alt: '课程表',
        openInNewTab: '在新标签页中查看文件',
        downloadFailed: '下载文件时发生错误。',
        gradeLabel: '{grade}年级',
        unknownGrade: '年级不明',
      },
    },
    file: {
      select: '选择文件',
      notSelected: '未选择任何文件',
      deleteAria: '删除文件',
      deleteTitle: '删除所选文件',
      helpPdfMax: '仅限PDF文件 (最大 {max}MB)',
      errorOnlyPdf: '只能选择PDF文件。',
      errorTooLarge: '文件大小超过限制（最大 {max}MB）。',
    },
  },
  ko: {
    common: {
      language: '한국어',
      logout: '로그아웃',
      required: '(필수)',
      optional: '(선택)',
      home: '홈',
      viewMore: '더보기',
      add: '추가',
      cancel: '취소',
      submit: '등록',
      back: '뒤로',
      close: '닫기',
      loading: '로딩 중...',
      footer: { copyright: '©VANTAN Inc.' },
    },
    menu: {
      home: '홈',
      news: '공지',
      calendar: '캘린더',
      timeschedules: '시간표',
      files: '파일',
      gallery: '학생 갤러리',
      users: '사용자 관리',
    },
    nav: {
      home: '홈',
      news: '공지',
      calendar: '캘린더',
      timeschedules: '시간표',
      files: '파일',
      gallery: '학생 갤러리',
      users: '사용자 관리',
    },
    modal: {
      addOptions: {
        addNews: '공지 추가',
        addArticle: '게시글 추가',
        addTimeSchedule: '시간표 추가',
      },
    },
    home: {
      importantNews: {
        title: '중요 공지',
        empty: '현재 중요한 공지가 없습니다.',
      },
      latestNews: {
        title: '최신 소식',
        empty: '현재 최신 소식이 없습니다.',
      },
    },
    timeschedule: {
      grade: '학년',
      gradeSuffix: '학년',
      title: '제목',
      titlePlaceholder: '제목을 입력해 주세요',
      attachment: '첨부 파일',
      noPermission: '권한이 없습니다. 조작할 수 없습니다.',
      requiredMissing: '필수 항목이 입력되지 않았습니다.',
      createFailed: '시간표 작성 중 에러가 발생했습니다.',

      add: {
        title: '시간표 추가',
      },

      filter: {
        gradeLabel: '학년 :',
        all: '전체',
        gradeSuffix: '학년',
      },

      item: {
        noFile: '이미지/파일 없음',
        uploaded: '업로드:',
        gradeSuffix: '학년',
        gradeUnknown: '학년 불명',
        imageAlt: '시간표 이미지',
        downloadTitle: '이미지/파일 다운로드',
      },

      list: {
        title: '시간표 리스트',
        loading: '데이터를 불러오는 중입니다...',
        empty: '해당하는 시간표가 없습니다.',
        fetchFailed: '시간표를 가져오는 데 실패했습니다',
        confirmDelete: '이 시간표를 삭제하시겠습니까?',
        deleteFailed: '삭제 중 에러가 발생했습니다.',
      },

      detail: {
        loading: '상세 데이터를 불러오는 중입니다...',
        fetchFailed: '상세 데이터를 가져오는 데 실패했습니다',
        apiError: '상세 데이터를 가져오는 데 실패했습니다.',
        noFile: '시간표 파일이 첨부되지 않았습니다.',
        alt: '시간표',
        openInNewTab: '새 탭에서 파일 보기',
        downloadFailed: '파일 다운로드 중 에러가 발생했습니다.',
        gradeLabel: '{grade}학년',
        unknownGrade: '학년 불명',
      },
    },
    file: {
      select: '파일 선택',
      notSelected: '선택된 파일이 없습니다',
      deleteAria: '파일 삭제',
      deleteTitle: '선택한 파일 삭제',
      helpPdfMax: 'PDF 파일만 가능 (최대 {max}MB)',
      errorOnlyPdf: 'PDF 파일만 선택할 수 있습니다.',
      errorTooLarge: '파일 용량이 너무 큽니다 (최대 {max}MB).',
    },
  },
}

export const i18n = createI18n({
  legacy: true,          // Option API 前提
  globalInjection: true, // this.$t を使えるようにする
  locale: 'ja',
  fallbackLocale: 'ja',
  messages,
})

export default i18n
