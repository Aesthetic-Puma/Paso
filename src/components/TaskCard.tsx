import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Task } from '../data/countries';
import { Colors, Fonts } from '../theme';

interface Props {
  task: Task;
  onAdvance: () => void;
}

const STATUS_LABELS: Record<Task['status'], string> = {
  todo: 'En attente',
  in_progress: 'En cours',
  done: 'Fait',
};

const STATUS_COLORS: Record<Task['status'], string> = {
  todo: Colors.muted,
  in_progress: Colors.accent,
  done: Colors.green,
};

const STATUS_BG: Record<Task['status'], string> = {
  todo: '#ece7dc',
  in_progress: '#fff3e8',
  done: Colors.greenLight,
};

export function TaskCard({ task, onAdvance }: Props) {
  const statusColor = STATUS_COLORS[task.status];
  const statusBg = STATUS_BG[task.status];
  const isDone = task.status === 'done';

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.checkbox} onPress={onAdvance} activeOpacity={0.7}>
        <View
          style={[
            styles.box,
            {
              borderColor: statusColor,
              backgroundColor: isDone ? statusColor : 'transparent',
            },
          ]}
        >
          {isDone && <Text style={styles.check}>✓</Text>}
          {task.status === 'in_progress' && <View style={styles.dot} />}
        </View>
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={[styles.label, isDone && styles.labelDone]}>{task.label}</Text>
        <View style={styles.meta}>
          <Text style={styles.time}>{task.time}</Text>
          {task.deadline && (
            <Text style={styles.deadline}>· {task.deadline}</Text>
          )}
          {task.link && (
            <TouchableOpacity onPress={() => Linking.openURL(task.link!)}>
              <Text style={styles.link}>Lien officiel ↗</Text>
            </TouchableOpacity>
          )}
          {task.critical && (
            <View style={styles.criticalBadge}>
              <Text style={styles.criticalText}>Critique</Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
        <Text style={[styles.statusText, { color: statusColor }]}>
          {STATUS_LABELS[task.status]}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 13,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  checkbox: {
    paddingTop: 1,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Fonts.sansBold,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 20,
  },
  labelDone: {
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  time: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.muted,
  },
  deadline: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: Colors.dark,
  },
  link: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: '#5a6f8a',
  },
  criticalBadge: {
    backgroundColor: '#fbe9e4',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  criticalText: {
    fontFamily: Fonts.sansBold,
    fontSize: 10,
    color: Colors.red,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  statusBadge: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexShrink: 0,
  },
  statusText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
  },
});
