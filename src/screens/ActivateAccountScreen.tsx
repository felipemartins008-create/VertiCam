import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { CheckCircle2, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, Check } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { VertiCamLogo } from '../components/VertiCamLogo';

export const ActivateAccountScreen: React.FC = () => {
  const { navigate, setSubscribed, updateProfile } = useApp();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Lê parâmetros da URL no ambiente Web (?email=...&payment=success)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlEmail = params.get('email') || params.get('customer_email') || params.get('prefilled_email');
      if (urlEmail) {
        setEmail(decodeURIComponent(urlEmail));
      }
    }
  }, []);

  const handleActivate = async () => {
    setErrorMessage(null);

    // Validações básicas
    if (!email || !email.includes('@')) {
      setErrorMessage('Inserisci un indirizzo e-mail valido.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La password deve contenere almeno 6 caratteri.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Le password non coincidono. Controlla e riprova.');
      return;
    }

    setLoading(true);

    try {
      // Tenta registrar no Supabase se configurado
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://')) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabaseAnonKey);
          const { error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
          });
          if (error && !error.message.includes('already registered')) {
            console.warn('Supabase auth notice:', error.message);
          }
        } catch (authErr) {
          console.warn('Auth fallback:', authErr);
        }
      }

      // Salva no perfil local e ativa assinatura
      await updateProfile({ email: email.trim() });
      setSubscribed(true);

      // Redireciona diretamente para o Dashboard do atleta
      setTimeout(() => {
        setLoading(false);
        navigate('Dashboard');
      }, 600);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err?.message || 'Si è verificato un errore. Riprova tra poco.');
    }
  };

  const passwordsMatch = password.length >= 6 && password === confirmPassword;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Cabeçalho com Logo */}
        <View style={styles.headerArea}>
          <VertiCamLogo size="medium" />
          <View style={styles.securityBadge}>
            <ShieldCheck size={14} color="#00E676" />
            <Text style={styles.securityBadgeText}>Pagamento Verificato SSL</Text>
          </View>
        </View>

        {/* Card Central de Ativação */}
        <View style={styles.card}>
          {/* Ícone de Sucesso */}
          <View style={styles.successIconCircle}>
            <CheckCircle2 size={44} color="#00E676" strokeWidth={2.5} />
          </View>

          <Text style={styles.headline}>Pagamento confermato! 🎉</Text>
          <Text style={styles.subheadline}>
            Crea la tua password personale per attivare il tuo account e iniziare il tuo programma di salto.
          </Text>

          {/* Banner de Plano Ativo */}
          <View style={styles.planBadgeCard}>
            <Sparkles size={18} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.planBadgeTitle}>VertiCam Pro Attivato</Text>
              <Text style={styles.planBadgeSubtitle}>Accesso completo al tracciamento ottico IA e ai protocolli</Text>
            </View>
          </View>

          {/* Mensagem de Erro se houver */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Campo E-mail */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>La tua e-mail di accesso</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#8A8D9B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="nome@email.com"
                placeholderTextColor="#5A5D6B"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Campo Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Crea una password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#8A8D9B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Almeno 6 caratteri"
                placeholderTextColor="#5A5D6B"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                activeOpacity={0.7}
              >
                {showPassword ? <EyeOff size={18} color="#8A8D9B" /> : <Eye size={18} color="#8A8D9B" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Campo Conferma Password */}
          <View style={styles.inputGroup}>
            <View style={styles.confirmLabelRow}>
              <Text style={styles.inputLabel}>Conferma la password</Text>
              {passwordsMatch && (
                <View style={styles.matchBadge}>
                  <Check size={12} color="#00E676" strokeWidth={3} />
                  <Text style={styles.matchBadgeText}>Corrisponde</Text>
                </View>
              )}
            </View>
            <View style={[styles.inputWrapper, passwordsMatch && styles.inputWrapperSuccess]}>
              <Lock size={18} color={passwordsMatch ? '#00E676' : '#8A8D9B'} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Ripeti la password"
                placeholderTextColor="#5A5D6B"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Botão de Conclusão */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            activeOpacity={0.88}
            onPress={handleActivate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>ATTIVA IL MIO ACCOUNT E INIZIA</Text>
                <ArrowRight size={18} color="#000000" strokeWidth={2.8} />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Riceverai anche una ricevuta e un link di accesso sicuro via e-mail.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0F',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 12,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.25)',
  },
  securityBadgeText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#141721',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 10,
  },
  successIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 230, 118, 0.35)',
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subheadline: {
    color: '#9E9E9E',
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  planBadgeCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    marginBottom: 24,
  },
  planBadgeTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  planBadgeSubtitle: {
    color: '#A0A3BD',
    fontSize: 11,
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 77, 77, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.4)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 18,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    color: '#D0D3E2',
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  confirmLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matchBadgeText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D0F16',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#262A38',
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapperSuccess: {
    borderColor: 'rgba(0, 230, 118, 0.5)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 6,
  },
  submitBtn: {
    width: '100%',
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  submitBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  footerNote: {
    color: '#717585',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
