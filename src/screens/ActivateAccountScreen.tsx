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
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Check,
  Ruler,
  Weight,
  HelpCircle,
  Activity,
  Dumbbell,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { VertiCamLogo } from '../components/VertiCamLogo';
import { VolleyballPosition } from '../types';

export const ActivateAccountScreen: React.FC = () => {
  const { navigate, setSubscribed, updateProfile, updateBaseline, athleteBaseline } = useApp();

  const [step, setStep] = useState<'credentials' | 'biometrics'>('credentials');

  // Step 1: Credenziali
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Step 2: Dati Biometrici essenziali per Loturco
  const [weightKg, setWeightKg] = useState<string>('78');
  const [heightCm, setHeightCm] = useState<string>('188');
  const [legLengthCm, setLegLengthCm] = useState<string>('94');
  const [position, setPosition] = useState<VolleyballPosition>('outside');
  const [equipment, setEquipment] = useState<'dumbbells' | 'barbell' | 'weight_vest' | 'bodyweight'>('dumbbells');
  const [showLegHelp, setShowLegHelp] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-carica email da URL su Web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlEmail = params.get('email') || params.get('customer_email') || params.get('prefilled_email');
      if (urlEmail) {
        setEmail(decodeURIComponent(urlEmail));
      }
    }
  }, []);

  const handleCredentialsSubmit = () => {
    setErrorMessage(null);

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

    // Passa allo Step 2 (Biometria)
    setStep('biometrics');
  };

  const handleFinalSubmit = async () => {
    setErrorMessage(null);

    const weightNum = parseFloat(weightKg);
    const heightNum = parseFloat(heightCm);
    const legNum = parseFloat(legLengthCm);

    if (isNaN(weightNum) || weightNum < 40 || weightNum > 160) {
      setErrorMessage('Inserisci un peso valido compreso tra 40 e 160 kg.');
      return;
    }

    if (isNaN(heightNum) || heightNum < 140 || heightNum > 230) {
      setErrorMessage('Inserisci un\'altezza valida compresa tra 140 e 230 cm.');
      return;
    }

    if (isNaN(legNum) || legNum < 60 || legNum > 130) {
      setErrorMessage('Inserisci una lunghezza gamba valida compresa tra 60 e 130 cm.');
      return;
    }

    setLoading(true);

    try {
      // 1. Tenta registrazione Supabase se configurato
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://')) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabaseAnonKey);
          await supabase.auth.signUp({
            email: email.trim(),
            password: password,
          });
        } catch (authErr) {
          console.warn('Auth fallback:', authErr);
        }
      }

      // 2. Salva nel profilo utente e baseline
      await updateProfile({
        email: email.trim(),
        weightKg: weightNum,
        heightCm: heightNum,
        legLengthCm: legNum,
        position: position,
        availableEquipment: equipment,
        isSubscribed: true,
      });

      updateBaseline({
        user_weight: weightNum,
        user_height: heightNum,
        user_leg_length_cm: legNum,
      });

      setSubscribed(true);

      // 3. Prosegui al Tutorial Onboarding (i 3 step specificati dall'utente)
      setTimeout(() => {
        setLoading(false);
        navigate('OnboardingTutorial');
      }, 500);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err?.message || 'Si è verificato un errore. Riprova tra poco.');
    }
  };

  const positions: { id: VolleyballPosition; label: string }[] = [
    { id: 'outside', label: 'Schiacciatore' },
    { id: 'opposite', label: 'Opposto' },
    { id: 'middle', label: 'Centrale' },
    { id: 'setter', label: 'Palleggiatore' },
    { id: 'libero', label: 'Libero' },
    { id: 'beach', label: 'Beach Volley' },
  ];

  const equipments: { id: 'dumbbells' | 'barbell' | 'weight_vest' | 'bodyweight'; label: string }[] = [
    { id: 'dumbbells', label: 'Manubri / Pesi a mano' },
    { id: 'barbell', label: 'Bilanciere' },
    { id: 'weight_vest', label: 'Giubbotto zavorrato' },
    { id: 'bodyweight', label: 'Corpo libero / Zavorre improvvisate' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Logo VertiCam */}
          <View style={styles.logoWrapper}>
            <VertiCamLogo size="medium" />
          </View>

          {/* Stepper Indicator */}
          <View style={styles.stepperRow}>
            <View style={[styles.stepDot, styles.stepDotActive]}>
              <Text style={styles.stepDotNumber}>1</Text>
            </View>
            <View style={[styles.stepLine, step === 'biometrics' && styles.stepLineActive]} />
            <View style={[styles.stepDot, step === 'biometrics' && styles.stepDotActive]}>
              <Text style={[styles.stepDotNumber, step !== 'biometrics' && styles.stepDotNumberInactive]}>2</Text>
            </View>
          </View>

          {step === 'credentials' ? (
            <>
              <View style={styles.headerBox}>
                <View style={styles.shieldPill}>
                  <ShieldCheck size={14} color={Colors.primary} strokeWidth={2.5} />
                  <Text style={styles.shieldPillText}>PAGAMENTO CONFERMATO</Text>
                </View>
                <Text style={styles.title}>Crea le tue Credenziali</Text>
                <Text style={styles.subtitle}>
                  Imposta la password di accesso a VertiCam Pro per accedere dal tuo smartphone o computer in qualsiasi momento.
                </Text>
              </View>

              {errorMessage && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Form Credenziali */}
              <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Indirizzo E-mail</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={18} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="latuaemail@esempio.com"
                      placeholderTextColor="#475569"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Crea una Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={18} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { paddingRight: 45 }]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Minimo 6 caratteri"
                      placeholderTextColor="#475569"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color="#64748B" />
                      ) : (
                        <Eye size={18} color="#64748B" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Conferma Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={18} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { paddingRight: 45 }]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Ripeti la password"
                      placeholderTextColor="#475569"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleCredentialsSubmit}
                  activeOpacity={0.88}
                >
                  <Text style={styles.primaryBtnText}>Continua: Dati Biometrici</Text>
                  <ArrowRight size={18} color="#000000" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* STEP 2: DATI BIOMETRICI */}
              <View style={styles.headerBox}>
                <View style={[styles.shieldPill, { backgroundColor: 'rgba(0, 229, 255, 0.12)', borderColor: 'rgba(0, 229, 255, 0.3)' }]}>
                  <Activity size={14} color={Colors.primary} strokeWidth={2.5} />
                  <Text style={styles.shieldPillText}>METODO LOTURCO & BOSCO</Text>
                </View>
                <Text style={styles.title}>Parametri Biometrici</Text>
                <Text style={styles.subtitle}>
                  Questi dati servono all'algoritmo per calcolare con precisione fisica la potenza meccanica (Watts) e la curva carico-velocità.
                </Text>
              </View>

              {errorMessage && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              <View style={styles.formSection}>
                {/* Peso e Altezza in riga */}
                <View style={styles.rowTwoCols}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Peso (kg)</Text>
                    <View style={styles.inputWrapper}>
                      <Weight size={18} color="#64748B" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={weightKg}
                        onChangeText={setWeightKg}
                        placeholder="78"
                        placeholderTextColor="#475569"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Altezza (cm)</Text>
                    <View style={styles.inputWrapper}>
                      <Ruler size={18} color="#64748B" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={heightCm}
                        onChangeText={setHeightCm}
                        placeholder="188"
                        placeholderTextColor="#475569"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>

                {/* Lunghezza Gamba (Trocantere al suolo) */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelWithHelp}>
                    <Text style={styles.inputLabel}>Lunghezza Arti Inferiori (cm)</Text>
                    <TouchableOpacity
                      onPress={() => setShowLegHelp(!showLegHelp)}
                      activeOpacity={0.7}
                      style={styles.helpBtn}
                    >
                      <HelpCircle size={14} color={Colors.primary} />
                      <Text style={styles.helpBtnText}>Come si misura?</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputWrapper}>
                    <Ruler size={18} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={legLengthCm}
                      onChangeText={setLegLengthCm}
                      placeholder="94"
                      placeholderTextColor="#475569"
                      keyboardType="numeric"
                    />
                  </View>

                  {showLegHelp && (
                    <View style={styles.legHelpCard}>
                      <Text style={styles.legHelpTitle}>📐 Misurazione Standard Loturco:</Text>
                      <Text style={styles.legHelpBody}>
                        In piedi con scarpe da gioco, misura con un metro la distanza tra il <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>grande trocantere</Text> (la sporgenza ossea laterale dell'anca) e il <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>pavimento</Text>.
                      </Text>
                      <Text style={styles.legHelpSub}>Tipicamente corrisponde a circa il 48-53% della propria statura.</Text>
                    </View>
                  )}
                </View>

                {/* Ruolo in campo */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Ruolo Principale</Text>
                  <View style={styles.chipsGrid}>
                    {positions.map((p) => {
                      const selected = position === p.id;
                      return (
                        <TouchableOpacity
                          key={p.id}
                          style={[styles.chipItem, selected && styles.chipItemSelected]}
                          onPress={() => setPosition(p.id)}
                          activeOpacity={0.8}
                        >
                          {selected && <Check size={12} color="#000000" strokeWidth={3} />}
                          <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                            {p.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Attrezzatura per il sovraccarico */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Attrezzatura Disponibile per i Salti con Carico</Text>
                  <View style={styles.equipmentColumn}>
                    {equipments.map((eq) => {
                      const selected = equipment === eq.id;
                      return (
                        <TouchableOpacity
                          key={eq.id}
                          style={[styles.equipmentItem, selected && styles.equipmentItemSelected]}
                          onPress={() => setEquipment(eq.id)}
                          activeOpacity={0.8}
                        >
                          <View style={[styles.radioCircle, selected && styles.radioCircleActive]}>
                            {selected && <View style={styles.radioDot} />}
                          </View>
                          <Text style={[styles.equipmentLabel, selected && styles.equipmentLabelSelected]}>
                            {eq.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                  onPress={handleFinalSubmit}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : (
                    <>
                      <Text style={styles.primaryBtnText}>Completa e Inizia il Tutorial</Text>
                      <ArrowRight size={18} color="#000000" strokeWidth={2.5} />
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setStep('credentials')}
                  style={styles.backBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backBtnText}>Torna alle credenziali</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#05070F',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 32,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#0D111F',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 24,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 12,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepDotNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  stepDotNumberInactive: {
    color: '#94A3B8',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#1E293B',
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  headerBox: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 20,
  },
  shieldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    marginBottom: 10,
  },
  shieldPillText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  formSection: {
    gap: 16,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 0.2,
  },
  labelWithHelp: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  helpBtnText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  legHelpCard: {
    backgroundColor: '#12172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    marginTop: 6,
    gap: 4,
  },
  legHelpTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  legHelpBody: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  legHelpSub: {
    fontSize: 10,
    color: '#64748B',
    fontStyle: 'italic',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13182C',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: 48,
    position: 'relative',
  },
  inputIcon: {
    marginLeft: 14,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 14,
    paddingHorizontal: 12,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    height: '100%',
    justifyContent: 'center',
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#13182C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  chipTextSelected: {
    color: '#000000',
    fontWeight: '800',
  },
  equipmentColumn: {
    gap: 8,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#13182C',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  equipmentItemSelected: {
    borderColor: 'rgba(0, 229, 255, 0.4)',
    backgroundColor: 'rgba(0, 229, 255, 0.06)',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  equipmentLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  equipmentLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  backBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
});
