<template>
  <div class="auth-page">
    <h1 class="page-title">{{ $t('auth.resetConfirm.title') }}</h1>

    <div class="auth-box">
      <p v-if="checkingToken" class="description">
        {{ $t('auth.resetConfirm.checkingLink') }}
      </p>
      <p v-else-if="!successMessage" class="description">
        {{ $t('auth.resetConfirm.prompt') }}
      </p>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}<br />
        {{ $t('auth.resetConfirm.countdownToLogin', { seconds: countdown }) }}
      </div>

      <form
        v-if="!checkingToken && !successMessage"
        @submit.prevent="submitPasswordReset"
      >
        <div class="input-section">
          <label class="input-label">
            {{ $t('auth.resetConfirm.newPassword') }}
            <span class="required">{{ $t('common.required') }}</span>
          </label>
          <input
            type="password"
            class="input-field"
            :placeholder="$t('auth.resetConfirm.newPasswordPlaceholder')"
            v-model="newPassword"
            required
            :disabled="loading"
            autocomplete="new-password"
          />
        </div>

        <div class="input-section">
          <label class="input-label">
            {{ $t('auth.resetConfirm.confirmPassword') }}
            <span class="required">{{ $t('common.required') }}</span>
          </label>
          <input
            type="password"
            class="input-field"
            :placeholder="$t('auth.resetConfirm.confirmPasswordPlaceholder')"
            v-model="reNewPassword"
            required
            :disabled="loading"
            autocomplete="new-password"
          />
        </div>

        <button type="submit" class="primary-button" :disabled="loading">
          <span v-if="loading">{{ $t('common.setting') }}</span>
          <span v-else>{{ $t('auth.resetConfirm.submit') }}</span>
        </button>

        <button
          type="button"
          class="cancel-button"
          @click="$router.push({ name: 'Login' }
