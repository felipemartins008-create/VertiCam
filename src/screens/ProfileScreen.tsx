import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  User,
  Shield,
  CreditCard,
  Download,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  Zap,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
import { t } from '../services/i18n';

export const ProfileScreen: React.FC = () => {
  const { userProfile, isSubscribed, navigate } = useApp();

  const initial = userProfile.initialJumpCm || 52.0;
  const current = userProfile.currentJumpCm || 61.8;
  const gain = Math.max(0, Math.round((current - initial) * 10) / 10);

  const handleExportData = () => {
    Alert.alert(
      'GDPR - Esportazione Dati',
      'Il pacchetto con i tuoi dati biometrici e lo storico dei salti è stato generato e inviato al tuo indirizzo email.',
      [{ text: 'OK' }]
    );
  };

  const handleManageSubscription = () => {
    Alert.alert(
      'Gestione Abbonamento',
      'L\'abbonamento VolleyJump PRO è attivo (349,00 € / anno). Prossimo rinnovo: 23.09.2027.',
      [
        { text: 'Disdici rinnovo', style: 'destructive' },
        { text: 'Chiudi', style: 'cancel' },
      ]
    );
  };

  const handleLogout = () => {
    navigate('Welcome');
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Karta Profilu Zawodnika */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <User size={36} color="#0F172A" />
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{userProfile.fullName || 'Pallavolista'}</Text>
              <View style={styles.proPill}>
                <Text style={styles.proPillText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.profileRole}>
              {userProfile.position.toUpperCase()} • {userProfile.level.toUpperCase()}
            </Text>
            <Text style={styles.profileParams}>
              {userProfile.heightCm} cm • {userProfile.weightKg} kg • {userProfile.age} anni
            </Text>
          </View>
        </View>

        {/* 3 Kluczowe Statystyki Atletyczne */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>SALTO INIZIALE</Text>
            <Text style={styles.statVal}>{initial.toFixed(1)} cm</Text>
            <Text style={styles.statSub}>Primo test</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCol}>
            <Text style={styles.statLabel}>SALTO ATTUALE</Text>
            <Text style={[styles.statVal, { color: Colors.primary }]}>
              {current.toFixed(1)} cm
            </Text>
            <Text style={styles.statSub}>Record personale</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCol}>
            <Text style={styles.statLabel}>GUADAGNO TOTALE</Text>
            <Text style={[styles.statVal, { color: Colors.accentGreen }]}>
              +{gain} cm
            </Text>
            <Text style={styles.statSub}>Incremento elevazione</Text>
          </View>
        </View>

        {/* Sekcja Subskrypcji */}
        <Text style={styles.sectionHeading}>{t('profile.subscriptionTitle')}</Text>
        <Card style={styles.subCard}>
          <View style={styles.subHeader}>
            <View style={styles.subBadge}>
              <Sparkles size={14} color="#0F172A" />
              <Text style={styles.subBadgeText}>ATTIVO</Text>
            </View>
            <Text style={styles.subPrice}>349,00 € / anno</Text>
          </View>

          <Text style={styles.subTitle}>{t('profile.activePlan')}</Text>
          <Text style={styles.subDetail}>{t('profile.renewalDate')}</Text>
          <Text style={styles.subDetail}>{t('profile.paymentVia')}</Text>

          <TouchableOpacity
            style={styles.manageSubBtn}
            onPress={handleManageSubscription}
            activeOpacity={0.8}
          >
            <CreditCard size={16} color={Colors.primary} />
            <Text style={styles.manageSubText}>{t('profile.manageSub')}</Text>
            <ChevronRight size={16} color={Colors.primary} />
          </TouchableOpacity>
        </Card>

        {/* Ustawienia i RODO / GDPR */}
        <Text style={styles.sectionHeading}>{t('profile.settingsTitle')}</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity
            style={styles.settingsItem}
            activeOpacity={0.8}
            onPress={handleExportData}
          >
            <View style={styles.settingsIconWrap}>
              <Download size={18} color={Colors.textPrimary} />
            </View>
            <View style={styles.settingsTextWrap}>
              <Text style={styles.settingsTitle}>{t('profile.exportData')}</Text>
              <Text style={styles.settingsSub}>Scarica una copia dello storico misurazioni</Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsItem}
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert(
                'Conformità GDPR',
                'VolleyJump AI tratta i dati biometrici in conformità al Regolamento Generale sulla Protezione dei Dati (UE) 2016/679 (GDPR). Hai il pieno diritto di consultazione e cancellazione dei tuoi dati in qualsiasi momento.'
              )
            }
          >
            <View style={styles.settingsIconWrap}>
              <Shield size={18} color={Colors.accentGreen} />
            </View>
            <View style={styles.settingsTextWrap}>
              <Text style={styles.settingsTitle}>{t('profile.gdpr')}</Text>
              <Text style={styles.settingsSub}>Informativa sulla privacy e protezione dati</Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsItem}
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert(
                'Wsparcie Trenera Siatkówki',
                'Nasz zespół trenerów przygotowania motorycznego odpowiada pod adresem: kontakt@siatkajump.pl'
              )
            }
          >
            <View style={styles.settingsIconWrap}>
              <HelpCircle size={18} color={Colors.accentBlue} />
            </View>
            <View style={styles.settingsTextWrap}>
              <Text style={styles.settingsTitle}>{t('profile.support')}</Text>
              <Text style={styles.settingsSub}>Zadaj pytanie dotyczące techniki</Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsItem, styles.logoutItem]}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <View style={[styles.settingsIconWrap, styles.logoutIconWrap]}>
              <LogOut size={18} color={Colors.secondary} />
            </View>
            <View style={styles.settingsTextWrap}>
              <Text style={[styles.settingsTitle, { color: Colors.secondary }]}>
                {t('profile.logout')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 20,
    gap: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  proPill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proPillText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 10,
  },
  profileRole: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  profileParams: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 24,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.cardBorder,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statVal: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  statSub: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  subCard: {
    padding: 18,
    marginBottom: 24,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  subBadgeText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 10,
  },
  subPrice: {
    color: Colors.textPrimary,
    fontWeight: '800',
    fontSize: 14,
  },
  subTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  subDetail: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  manageSubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  manageSubText: {
    flex: 1,
    marginLeft: 8,
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  settingsGroup: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: 14,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  settingsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIconWrap: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  settingsTextWrap: {
    flex: 1,
  },
  settingsTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  settingsSub: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
