import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import {
  User,
  CreditCard,
  Lock,
  Mail,
  ShieldCheck,
  Calendar,
  Ruler,
  Weight,
  ExternalLink,
  LogOut,
  ChevronRight,
  Check,
  Edit2,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { VertiCamLogo } from '../components/VertiCamLogo';

export const ProfileScreen: React.FC = () => {
  const { userProfile, updateProfile, isSubscribed, navigate } = useApp();

  const [isEditingBiometrics, setIsEditingBiometrics] = useState<boolean>(false);
  const [weight, setWeight] = useState<string>(String(userProfile.weightKg || 78));
  const [height, setHeight] = useState<string>(String(userProfile.heightCm || 188));
  const [legLength, setLegLength] = useState<string>(String(userProfile.legLengthCm || 94));

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSaveBiometrics = async () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const l = parseFloat(legLength);

    if (isNaN(w) || isNaN(h) || isNaN(l)) {
      Alert.alert('Errore', 'Inserisci valori numerici validi.');
      return;
    }

    await updateProfile({
      weightKg: w,
      heightCm: h,
      legLengthCm: l,
    });

    setIsEditingBiometrics(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Modifica Password',
      'Ti è stata inviata un\'email per impostare una nuova password sicura al tuo indirizzo: ' + (userProfile.email || 'latuaemail@esempio.com'),
      [{ text: 'OK' }]
    );
  };

  const handleStripePortal = () => {
    Alert.alert(
      'Gestione Pagamento Stripe',
      'Il tuo abbonamento VertiCam Pro è attivo con crittografia Stripe a 256-bit.\n\nPer modificare metodo di pagamento o scaricare fatture, accedi al portale clienti Stripe.',
      [
        { text: 'Chiudi', style: 'cancel' },
      ]
    );
  };

  const handleLogout = () => {
    navigate('Welcome');
  };

  const windowWidth = Dimensions.get('window').width;
  const isDesktop = windowWidth >= 768;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.topHeader}>
          <VertiCamLogo size="small" variant="badge" />
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.7}>
            <LogOut size={16} color="#64748B" />
            <Text style={styles.logoutBtnText}>Esci</Text>
          </TouchableOpacity>
        </View>

        {/* ── CARD ATLETA & PIANO PRO ── */}
        <View style={styles.athleteCard}>
          <View style={styles.avatarCircle}>
            <User size={30} color="#000000" strokeWidth={2.5} />
          </View>
          <View style={styles.athleteInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.athleteName}>{userProfile.fullName || 'Atleta VertiCam'}</Text>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.athleteEmail}>{userProfile.email || 'atleta@verticam.com'}</Text>
          </View>
        </View>

        {/* ── DATI BIOMETRICI (METODO LOTURCO) ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionCategory}>PARAMETRI FISIOLOGICI</Text>
              <Text style={styles.sectionTitle}>Dati Biometrici</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsEditingBiometrics(!isEditingBiometrics)}
              style={styles.editActionBtn}
              activeOpacity={0.7}
            >
              <Edit2 size={13} color={Colors.primary} />
              <Text style={styles.editActionBtnText}>
                {isEditingBiometrics ? 'Annulla' : 'Modifica'}
              </Text>
            </TouchableOpacity>
          </View>

          {saveSuccess && (
            <View style={styles.saveAlert}>
              <Check size={14} color="#10B981" />
              <Text style={styles.saveAlertText}>Dati biometrici aggiornati con successo!</Text>
            </View>
          )}

          {isEditingBiometrics ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Peso (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Altezza (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Lunghezza Gamba (Trocantere al suolo - cm)</Text>
                <TextInput
                  style={styles.input}
                  value={legLength}
                  onChangeText={setLegLength}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveBiometrics}
                activeOpacity={0.88}
              >
                <Text style={styles.saveBtnText}>Salva Nuovi Dati</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.biometricsRow}>
              <View style={styles.bioItem}>
                <Weight size={18} color={Colors.primary} />
                <Text style={styles.bioValue}>{userProfile.weightKg || 78} kg</Text>
                <Text style={styles.bioLabel}>Peso Corporeo</Text>
              </View>

              <View style={styles.bioDivider} />

              <View style={styles.bioItem}>
                <Ruler size={18} color={Colors.primary} />
                <Text style={styles.bioValue}>{userProfile.heightCm || 188} cm</Text>
                <Text style={styles.bioLabel}>Statura</Text>
              </View>

              <View style={styles.bioDivider} />

              <View style={styles.bioItem}>
                <Ruler size={18} color={Colors.primary} />
                <Text style={styles.bioValue}>{userProfile.legLengthCm || 94} cm</Text>
                <Text style={styles.bioLabel}>Arti Inferiori</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── IMPOSTAZIONI ACCOUNT & SICUREZZA ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionCategory}>SICUREZZA & ACCESSO</Text>
          <Text style={styles.sectionTitle}>Credenziali dell'Account</Text>

          <View style={styles.accountItemRow}>
            <View style={styles.accountItemLeft}>
              <Mail size={18} color="#64748B" />
              <View>
                <Text style={styles.accountItemLabel}>Email di Accesso</Text>
                <Text style={styles.accountItemValue}>{userProfile.email || 'atleta@verticam.com'}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.accountActionRow}
            onPress={handleChangePassword}
            activeOpacity={0.7}
          >
            <View style={styles.accountItemLeft}>
              <Lock size={18} color="#64748B" />
              <View>
                <Text style={styles.accountItemLabel}>Password</Text>
                <Text style={styles.accountItemSub}>••••••••••••</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* ── PIANI & GESTIONE PAGAMENTO STRIPE ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionCategory}>FATTURAZIONE & ABBONAMENTO</Text>
          <Text style={styles.sectionTitle}>Piano Attivo & Pagamenti</Text>

          <View style={styles.subscriptionCard}>
            <View style={styles.subCardTop}>
              <View>
                <Text style={styles.subPlanTitle}>VertiCam Pro</Text>
                <Text style={styles.subPlanCadence}>Accesso completo e illimitato con IA</Text>
              </View>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>ATTIVO</Text>
              </View>
            </View>

            <View style={styles.stripeAuditLine}>
              <ShieldCheck size={14} color="#10B981" />
              <Text style={styles.stripeAuditText}>
                Fatturazione protetta da Stripe Inc. (Crittografia 256-bit)
              </Text>
            </View>

            <TouchableOpacity
              style={styles.stripePortalBtn}
              onPress={handleStripePortal}
              activeOpacity={0.88}
            >
              <CreditCard size={16} color="#FFFFFF" />
              <Text style={styles.stripePortalBtnText}>Gestisci Pagamento & Fatture</Text>
              <ExternalLink size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070F',
  },
  scrollContent: {
    padding: 16,
    paddingVertical: 20,
    gap: 16,
  },
  scrollContentDesktop: {
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#12172A',
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  athleteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#0D111F',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  athleteInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  athleteName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  proBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  proBadgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  athleteEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  // Sections
  sectionCard: {
    backgroundColor: '#0D111F',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  editActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  editActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  saveAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 10,
    borderRadius: 8,
  },
  saveAlertText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '700',
  },
  biometricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#12172A',
    borderRadius: 14,
    padding: 16,
  },
  bioItem: {
    alignItems: 'center',
    gap: 4,
  },
  bioValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  bioLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  bioDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  editForm: {
    gap: 12,
    marginTop: 6,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  input: {
    backgroundColor: '#12172A',
    borderRadius: 10,
    height: 44,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 13,
  },

  // Account
  accountItemRow: {
    backgroundColor: '#12172A',
    padding: 14,
    borderRadius: 12,
  },
  accountActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#12172A',
    padding: 14,
    borderRadius: 12,
  },
  accountItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountItemLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  accountItemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  accountItemSub: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
  },

  // Subscription
  subscriptionCard: {
    backgroundColor: '#12172A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    gap: 12,
  },
  subCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subPlanTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subPlanCadence: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  activePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#10B981',
  },
  stripeAuditLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stripeAuditText: {
    fontSize: 11,
    color: '#64748B',
  },
  stripePortalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#090D1A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    height: 44,
    borderRadius: 10,
    marginTop: 4,
  },
  stripePortalBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
