import { Stepper, Text } from '@mantine/core';
import styles from './UploadFlowIndicator.module.css';

interface UploadFlowIndicatorProps {
  currentStep: 'upload' | 'review' | 'submit';
  orientation?: 'horizontal' | 'vertical';
  onStepClick?: (step: 'upload' | 'review' | 'submit') => void;
}

const steps = [
  { label: 'Upload', key: 'upload' },
  { label: 'Review', key: 'review' },
  { label: 'Submit', key: 'submit' },
];

// Custom step icon component
function StepIcon({ stepNumber, isCompleted, isActive }: { stepNumber: number; isCompleted: boolean; isActive: boolean }) {
  return (
    <div 
      className={styles.stepIcon}
      data-progress={isActive ? true : undefined}
      data-completed={isCompleted ? true : undefined}
    >
      <Text size="xs" fw="bold">
        {stepNumber}
      </Text>
    </div>
  );
}

export function UploadFlowIndicator({ currentStep, onStepClick }: UploadFlowIndicatorProps) {
    const active = steps.findIndex(s => s.key === currentStep);

    const stepperClassNames = {
        root: styles.root,
        steps: styles.steps,
        step: styles.step,
        stepIcon: styles.stepIcon,
        stepLabel: styles.stepLabel,
        separator: styles.separator,
    };

    return (
        <Stepper
            active={active}
            orientation='horizontal'
            onStepClick={onStepClick ? (idx) => onStepClick(steps[idx].key as any) : undefined}
            classNames={stepperClassNames}
            allowNextStepsSelect={false}
            size="md"
            iconSize={20}
            color="dark"
        >
        {steps.map((step, index) => (
            <Stepper.Step 
                key={step.key} 
                label={step.label}
                allowStepSelect={onStepClick !== undefined && index < active}
                icon={<StepIcon stepNumber={index + 1} isCompleted={index < active} isActive={index === active} />}
                completedIcon={<StepIcon stepNumber={index + 1} isCompleted={true} isActive={false} />}
            />
        ))}
        </Stepper>
    );
} 
