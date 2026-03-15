import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Text, TextInput, View } from 'react-native';

import InteractivePressable from './InteractivePressable';
import { COLORS, RADIUS, SPACING } from '../styles/theme';
import type { MealEntry } from '../types/health';
import { formatIsoDateTime } from '../utils/health';

type MealHistoryCardProps = {
  entry: MealEntry;
  onSave: (
    entryId: string,
    payload: {
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    },
  ) => Promise<void>;
  onRepeat: (entryId: string) => Promise<void>;
  onToggleFavorite: (entryId: string, nextValue: boolean) => Promise<void>;
  onDelete: (entryId: string) => Promise<void>;
};

export default function MealHistoryCard({
  entry,
  onSave,
  onRepeat,
  onToggleFavorite,
  onDelete,
}: MealHistoryCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: entry.name,
    calories: String(entry.calories),
    protein: String(entry.protein),
    carbs: String(entry.carbs),
    fats: String(entry.fats),
  });

  useEffect(() => {
    setForm({
      name: entry.name,
      calories: String(entry.calories),
      protein: String(entry.protein),
      carbs: String(entry.carbs),
      fats: String(entry.fats),
    });
  }, [entry.calories, entry.carbs, entry.fats, entry.name, entry.protein]);

  const correctionLabel = useMemo(() => {
    if (!entry.user_corrections) return null;
    return 'Edited by user';
  }, [entry.user_corrections]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Missing name', 'Meal name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      await onSave(entry.id, {
        name: form.name.trim(),
        calories: Number(form.calories) || 0,
        protein: Number(form.protein) || 0,
        carbs: Number(form.carbs) || 0,
        fats: Number(form.fats) || 0,
      });
      setEditing(false);
    } catch (error: any) {
      Alert.alert('Save failed', error?.message || 'Could not update this meal.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete meal', 'This meal will be removed from history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await onDelete(entry.id);
          } catch (error: any) {
            Alert.alert('Delete failed', error?.message || 'Could not delete this meal.');
          }
        },
      },
    ]);
  };

  const textInputStyle = {
    backgroundColor: COLORS.cardInner,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.md,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    minHeight: 48,
    fontSize: 15,
  } as const;

  return (
    <View
      style={{
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.borderSoft,
        borderRadius: RADIUS.xl,
        padding: SPACING.card,
        gap: SPACING.md,
      }}
    >
      {entry.image_uri ? (
        <Image
          source={{ uri: entry.image_uri }}
          style={{ width: '100%', height: 180, borderRadius: RADIUS.lg }}
        />
      ) : null}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.md }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: '900' }}>{entry.name}</Text>
          <Text style={{ color: COLORS.subtitle, fontSize: 13 }}>
            {entry.meal_type_label} • {formatIsoDateTime(entry.created_at)}
          </Text>
          <Text style={{ color: COLORS.muted, fontSize: 13 }}>
            {entry.source === 'scan' ? 'AI meal log' : 'Manual meal log'}
            {correctionLabel ? ` • ${correctionLabel}` : ''}
          </Text>
        </View>

        <InteractivePressable
          onPress={() => onToggleFavorite(entry.id, !entry.favorite)}
          style={{
            alignSelf: 'flex-start',
            backgroundColor: entry.favorite ? COLORS.accentSoft : COLORS.surface,
            borderRadius: RADIUS.pill,
            borderWidth: 1,
            borderColor: entry.favorite ? COLORS.accent : COLORS.borderSoft,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
          }}
        >
          <Text style={{ color: entry.favorite ? COLORS.accent : COLORS.text, fontWeight: '800' }}>
            {entry.favorite ? 'Favorited' : 'Favorite'}
          </Text>
        </InteractivePressable>
      </View>

      {entry.ai_description ? (
        <Text style={{ color: COLORS.subtitle, fontSize: 14, lineHeight: 20 }}>
          {entry.ai_description}
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
        {[
          `${entry.calories} kcal`,
          `P ${entry.protein}g`,
          `C ${entry.carbs}g`,
          `F ${entry.fats}g`,
        ].map((token) => (
          <View
            key={token}
            style={{
              backgroundColor: COLORS.cardInner,
              borderWidth: 1,
              borderColor: COLORS.borderSoft,
              borderRadius: RADIUS.pill,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
            }}
          >
            <Text style={{ color: COLORS.text, fontSize: 12, fontWeight: '800' }}>{token}</Text>
          </View>
        ))}
      </View>

      {entry.improvement_suggestions.length > 0 ? (
        <View style={{ gap: 6 }}>
          {entry.improvement_suggestions.map((suggestion) => (
            <Text key={suggestion} style={{ color: COLORS.subtitle, fontSize: 13, lineHeight: 19 }}>
              • {suggestion}
            </Text>
          ))}
        </View>
      ) : null}

      {editing ? (
        <View style={{ gap: SPACING.sm }}>
          <TextInput
            value={form.name}
            onChangeText={(value) => setForm((current) => ({ ...current, name: value }))}
            placeholder="Meal name"
            placeholderTextColor={COLORS.muted}
            style={textInputStyle}
          />

          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            {[
              ['calories', 'Calories'],
              ['protein', 'Protein'],
              ['carbs', 'Carbs'],
              ['fats', 'Fats'],
            ].map(([field, label]) => (
              <TextInput
                key={field}
                value={form[field as keyof typeof form]}
                onChangeText={(value) =>
                  setForm((current) => ({
                    ...current,
                    [field]: value,
                  }))
                }
                placeholder={label}
                placeholderTextColor={COLORS.muted}
                keyboardType="numeric"
                style={[textInputStyle, { flex: 1 }]}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
        <InteractivePressable
          style={{
            backgroundColor: COLORS.accent,
            borderRadius: RADIUS.md,
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
          }}
          onPress={() => (editing ? handleSave() : setEditing(true))}
          disabled={saving}
        >
          <Text style={{ color: COLORS.accentDark, fontWeight: '900' }}>
            {saving ? 'Saving...' : editing ? 'Save edits' : 'Edit nutrition'}
          </Text>
        </InteractivePressable>

        <InteractivePressable
          style={{
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: COLORS.borderSoft,
            borderRadius: RADIUS.md,
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
          }}
          onPress={() => onRepeat(entry.id)}
        >
          <Text style={{ color: COLORS.text, fontWeight: '800' }}>Repeat meal</Text>
        </InteractivePressable>

        <InteractivePressable
          style={{
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: COLORS.borderSoft,
            borderRadius: RADIUS.md,
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
          }}
          onPress={handleDelete}
        >
          <Text style={{ color: COLORS.text, fontWeight: '800' }}>Delete</Text>
        </InteractivePressable>
      </View>
    </View>
  );
}
