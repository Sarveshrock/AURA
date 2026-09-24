import { Workflow } from 'lucide-react';
import { automationsStore, runsStore, type RunLog } from './stores';
import { uid } from './store';
import { toast } from '../components/ui';
import type { Automation, AutoTemplate } from '../data/mockAutomations';
import type { Draft } from '../components/automations';

const stamp = () => new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(',', '').replace(/,(?= \d+:)/, ' •');

/** Shared automation commands used by Automation Hub + Automations. */
export const automationActions = {
  toggle(a: Automation, active: boolean) {
    automationsStore.set((as) => as.map((x) => (x.id === a.id ? { ...x, active } : x)));
    toast(`${a.name} ${active ? 'activated' : 'paused'}.`);
  },
  run(a: Automation) {
    const status: RunLog['status'] = a.needsApproval ? 'Awaiting approval' : 'Completed';
    runsStore.set((rs) => [{ id: uid('rn'), name: a.name, when: stamp(), status }, ...rs].slice(0, 20));
    automationsStore.set((as) => as.map((x) => (x.id === a.id ? { ...x, lastRun: 'Just now' } : x)));
    toast(a.needsApproval ? `${a.name} prepared its actions and is waiting for your approval.` : `${a.name} ran successfully (demo run).`);
  },
  duplicate(a: Automation) {
    automationsStore.set((as) => [...as, { ...a, id: uid('au'), name: `${a.name} (copy)`, active: false, featured: false }]);
    toast('Duplicated as a paused copy.');
  },
  remove(a: Automation) {
    automationsStore.set((as) => as.filter((x) => x.id !== a.id));
    toast(`Deleted “${a.name}”.`);
  },
  fromTemplate(t: AutoTemplate) {
    automationsStore.set((as) => [...as, { id: uid('au'), name: t.name, description: t.description, icon: t.icon, tone: t.tone, tags: t.tags, category: t.category, schedule: t.schedule, active: false, lastRun: 'Never' }]);
    toast(`“${t.name}” added (paused). Turn it on when you're ready.`);
  },
  fromDraft(d: Draft, existing?: Automation) {
    if (existing) {
      automationsStore.set((as) => as.map((x) => (x.id === existing.id ? { ...x, name: d.name, description: d.description, trigger: d.trigger, steps: d.steps, needsApproval: d.needsApproval, schedule: d.schedule } : x)));
      toast('Automation updated.');
      return;
    }
    automationsStore.set((as) => [...as, {
      id: uid('au'), name: d.name, description: d.description, icon: Workflow, tone: 'cyan', tags: [d.category, d.needsApproval ? 'Approval gate' : 'Auto'],
      category: d.category, schedule: d.schedule, active: false, trigger: d.trigger, steps: d.steps, needsApproval: d.needsApproval, lastRun: 'Never',
    }]);
    toast(`“${d.name}” created (paused).`);
  },
  toDraft(a: Automation): Draft {
    return { name: a.name, description: a.description, category: a.category, trigger: a.trigger ?? (a.schedule.startsWith('Runs daily') ? 'Every day at 8:00 AM' : 'When I ask AURA'), steps: a.steps ?? [a.description], schedule: a.schedule, needsApproval: !!a.needsApproval };
  },
};
