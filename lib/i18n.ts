export type Lang = 'ru' | 'en'

export const translations = {
  ru: {
    // App name
    appName: 'Привычка',

    // General
    add:     'Добавить',
    save:    'Сохранить',
    cancel:  'Отмена',
    delete:  'Удалить',
    reset:   'Сбросить',
    undo:    'Отменить',
    edit:    'Редактировать',
    close:   'Закрыть',
    login:   'Войти',
    logout:  'Выйти',
    profile: 'Профиль и API-ключи',

    // Frequency labels
    daily:    'Ежедневно',
    weekdays: 'По будням',
    weekends: 'По выходным',
    weekly:   'Еженедельно',

    // app/page.tsx
    allDone:        '🎉 Все привычки выполнены!',
    doneToday:      'Выполнено {done} из {total} сегодня',
    dayProgress:    'Прогресс дня',
    saveHistory:    'Сохраняй историю',
    loginPrompt:    'Войди, чтобы данные не потерялись',
    tabHabits:      'Привычки',
    tabAnti:        'Анти',
    tabAchievements:'Достижения',
    viewBy:         'Вид:',
    byGroup:        'По группам',
    byFrequency:    'По частоте',
    noHabits:       'Нет привычек',
    noHabitsDesc:   'Добавьте первую привычку и начните отслеживать свой прогресс каждый день',
    addFirstHabit:  'Добавить первую привычку',
    ungrouped:      'Без группы',

    // GroupSection
    habit_one:  'привычка',
    habit_few:  'привычки',
    habit_many: 'привычек',

    // HabitCard
    doneButton:       'Отметить выполненным',
    doneTodayLabel:   'Выполнено сегодня',
    reminderLabel:    '🔔 Напоминание',
    reminderTime:     'Время:',
    reminderNote:     'Уведомление придёт каждый день в {time}, если привычка не выполнена. Разреши уведомления в браузере.',
    resetProgress:    'Сбросить прогресс',
    daysLabel:        'дней',
    expectedLabel:    'ожид.',

    // AntiHabitCard
    noStreak:         'серии нет — начни сегодня!',
    cleanDays_one:    'чистый день',
    cleanDays_few:    'чистых дня',
    cleanDays_many:   'чистых дней',
    inARow:           'подряд',
    todayQuestion:    'Сегодня было?',
    noClear:          '✓ Нет, чисто',
    yesFailed:        'Да, был срыв',
    cleanToday:       '✓ Сегодня чисто!',
    failedToday:      '😔 Сегодня был срыв',
    noWorries:        'Ничего страшного — завтра новая попытка 💙',
    resetStreak:      'Сбросить серию',

    // AntiHabitsSection
    noAntiHabits:     'Нет анти-привычек',
    noAntiHabitsDesc: 'Добавь то, от чего хочешь отказаться — соцсети, сахар, поздний сон — и следи за чистой серией',
    addAntiHabit:     'Добавить анти-привычку',
    weekResults:      '📊 Итоги недели',
    totalCleanDays:   'Итого чистых дней',

    // AchievementsSection
    myAchievements:     'Мои достижения',
    weekProgress:       'Прогресс за текущую неделю',
    completedThisWeek:  'Выполнено за неделю',
    ofCompletions:      '{done} из {total} выполнений',
    today:              'Сегодня',
    streak:             'Серия',
    habits:             'Привычек',
    total:              'всего',
    unlocked:           'Разблокировано',
    onFireTitle:        'На огне',
    onFireDesc:         '3+ дней подряд',
    starWeekTitle:      'Звёздная неделя',
    starWeekDesc:       '100% за неделю',
    perfectDayTitle:    'Идеальный день',
    perfectDayDesc:     'Все привычки сегодня',
    halfwayTitle:       'Полпути',
    halfwayDesc:        '50%+ за неделю',

    // AddHabitModal
    newHabit:           'Новая привычка',
    editHabit:          'Редактировать привычку',
    habitName:          'Название',
    habitNamePlaceholder: 'Например: Утренняя медитация',
    habitIcon:          'Иконка',
    habitColor:         'Цвет',
    habitFrequency:     'Частота',
    habitGroup:         'Группа',
    newGroup:           'Новая группа',
    newGroupLabel:      'Новая группа',
    groupNamePlaceholder: 'Название группы',
    noGroup:            'Без группы',

    // AddAntiHabitModal
    newAntiHabit:         'Новая анти-привычка',
    antiHabitName:        'Что хочешь избежать?',
    antiHabitNameHint:    'Начни с «Не»: «Не открывал соцсети», «Не ел сахар»',
    antiHabitPlaceholder: 'Не открывал соцсети',
    reasonLabel:          'Причина',
    reasonOptional:       '(необязательно)',
    reasonPlaceholder:    'Чтобы больше времени на чтение',

    // login/page.tsx
    subtitle:       'Войди, чтобы сохранять историю на всех устройствах',
    googleError:    'Не удалось войти через Google. Попробуй ещё раз.',
    loginWithGoogle: 'Войти через Google',

    // profile/page.tsx
    backToTracker:        '← К трекеру',
    mcpServer:            'MCP-сервер',
    mcpDesc:              'Подключи Claude к своим привычкам через API-ключ. Работает с',
    mcpDescEnd:           'и',
    mcpAddress:           'Сервер доступен по адресу',
    createApiKey:         'Создать API-ключ',
    keyNamePlaceholder:   'Название, например "Claude Code"',
    create:               'Создать',
    creating:             '…',
    activeKeys:           'Активные ключи',
    noActiveKeys:         'Нет активных ключей — создай первый выше',
    revokedKeys:          'Отозванные ключи',
    revoke:               'Отозвать',
    revoking:             '…',
    createdAt:            'Создан',
    usedAt:               'Использован',
    revokedAt:            'Отозван',
    keyCreated:           'Ключ создан',
    saveKeyWarning:       'Сохрани его сейчас — он больше не будет показан',
    apiKeyLabel:          'API-ключ',
    mcpConfigLabel:       'MCP-конфиг (Claude Code / Claude Desktop)',
    mcpConfigHint:        'Вставь этот фрагмент в ~/.claude.json (Claude Code) или в настройки MCP Claude Desktop',
    copy:                 'Копировать',
    copied:               '✓ Скопировано',
    savedClose:           'Я сохранил ключ — закрыть',
    failedCreateKey:      'Не удалось создать ключ',
    failedRevokeKey:      'Не удалось отозвать ключ',
    telegramId:           'Telegram ID',
    revokedLabel:         'Отозван',
  },

  en: {
    // App name
    appName: 'Ritualr',

    // General
    add:     'Add',
    save:    'Save',
    cancel:  'Cancel',
    delete:  'Delete',
    reset:   'Reset',
    undo:    'Undo',
    edit:    'Edit',
    close:   'Close',
    login:   'Sign in',
    logout:  'Sign out',
    profile: 'Profile & API Keys',

    // Frequency labels
    daily:    'Daily',
    weekdays: 'Weekdays',
    weekends: 'Weekends',
    weekly:   'Weekly',

    // app/page.tsx
    allDone:        '🎉 All habits done!',
    doneToday:      '{done} of {total} done today',
    dayProgress:    "Today's progress",
    saveHistory:    'Save your progress',
    loginPrompt:    'Sign in to keep your data safe',
    tabHabits:      'Habits',
    tabAnti:        'Anti',
    tabAchievements:'Achievements',
    viewBy:         'View:',
    byGroup:        'By group',
    byFrequency:    'By frequency',
    noHabits:       'No habits yet',
    noHabitsDesc:   'Add your first habit and start tracking your progress every day',
    addFirstHabit:  'Add first habit',
    ungrouped:      'Ungrouped',

    // GroupSection
    habit_one:  'habit',
    habit_few:  'habits',
    habit_many: 'habits',

    // HabitCard
    doneButton:       'Mark as done',
    doneTodayLabel:   'Done today',
    reminderLabel:    '🔔 Reminder',
    reminderTime:     'Time:',
    reminderNote:     'A notification will arrive every day at {time} if the habit is not completed. Allow notifications in your browser.',
    resetProgress:    'Reset progress',
    daysLabel:        'days',
    expectedLabel:    'exp.',

    // AntiHabitCard
    noStreak:         'no streak — start today!',
    cleanDays_one:    'clean day',
    cleanDays_few:    'clean days',
    cleanDays_many:   'clean days',
    inARow:           'in a row',
    todayQuestion:    'Did it happen today?',
    noClear:          '✓ No, clean',
    yesFailed:        'Yes, I slipped',
    cleanToday:       '✓ Clean today!',
    failedToday:      '😔 Slipped today',
    noWorries:        'No worries — try again tomorrow 💙',
    resetStreak:      'Reset streak',

    // AntiHabitsSection
    noAntiHabits:     'No anti-habits yet',
    noAntiHabitsDesc: 'Add what you want to quit — social media, sugar, late nights — and track your clean streak',
    addAntiHabit:     'Add anti-habit',
    weekResults:      '📊 Weekly results',
    totalCleanDays:   'Total clean days',

    // AchievementsSection
    myAchievements:     'My Achievements',
    weekProgress:       "This week's progress",
    completedThisWeek:  'Completed this week',
    ofCompletions:      '{done} of {total} completions',
    today:              'Today',
    streak:             'Streak',
    habits:             'Habits',
    total:              'total',
    unlocked:           'Unlocked',
    onFireTitle:        'On Fire',
    onFireDesc:         '3+ days in a row',
    starWeekTitle:      'Star Week',
    starWeekDesc:       '100% this week',
    perfectDayTitle:    'Perfect Day',
    perfectDayDesc:     'All habits today',
    halfwayTitle:       'Halfway',
    halfwayDesc:        '50%+ this week',

    // AddHabitModal
    newHabit:           'New habit',
    editHabit:          'Edit habit',
    habitName:          'Name',
    habitNamePlaceholder: 'e.g. Morning meditation',
    habitIcon:          'Icon',
    habitColor:         'Color',
    habitFrequency:     'Frequency',
    habitGroup:         'Group',
    newGroup:           'New group',
    newGroupLabel:      'New group',
    groupNamePlaceholder: 'Group name',
    noGroup:            'No group',

    // AddAntiHabitModal
    newAntiHabit:         'New anti-habit',
    antiHabitName:        'What do you want to avoid?',
    antiHabitNameHint:    'Start with "No": "No social media", "No sugar"',
    antiHabitPlaceholder: 'No social media',
    reasonLabel:          'Reason',
    reasonOptional:       '(optional)',
    reasonPlaceholder:    'To have more time for reading',

    // login/page.tsx
    subtitle:       'Sign in to save your history across devices',
    googleError:    'Failed to sign in with Google. Please try again.',
    loginWithGoogle: 'Sign in with Google',

    // profile/page.tsx
    backToTracker:        '← Back to tracker',
    mcpServer:            'MCP Server',
    mcpDesc:              'Connect Claude to your habits via API key. Works with',
    mcpDescEnd:           'and',
    mcpAddress:           'Server available at',
    createApiKey:         'Create API Key',
    keyNamePlaceholder:   'Name, e.g. "Claude Code"',
    create:               'Create',
    creating:             '…',
    activeKeys:           'Active keys',
    noActiveKeys:         'No active keys — create your first one above',
    revokedKeys:          'Revoked keys',
    revoke:               'Revoke',
    revoking:             '…',
    createdAt:            'Created',
    usedAt:               'Used',
    revokedAt:            'Revoked',
    keyCreated:           'Key created',
    saveKeyWarning:       'Save it now — it will not be shown again',
    apiKeyLabel:          'API Key',
    mcpConfigLabel:       'MCP config (Claude Code / Claude Desktop)',
    mcpConfigHint:        'Paste this snippet into ~/.claude.json (Claude Code) or the MCP settings in Claude Desktop',
    copy:                 'Copy',
    copied:               '✓ Copied',
    savedClose:           'I saved the key — close',
    failedCreateKey:      'Failed to create key',
    failedRevokeKey:      'Failed to revoke key',
    telegramId:           'Telegram ID',
    revokedLabel:         'Revoked',
  },
} as const

export type TranslationKey = keyof typeof translations.ru

import type { Frequency } from './types'

export function getFrequencyLabel(freq: Frequency, lang: Lang): string {
  return translations[lang][freq]
}
