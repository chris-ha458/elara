import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
  Box,
  Stack,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { MdSave, MdConstruction } from "react-icons/md";
import { FaComputer } from "react-icons/fa6";
import { IoIosRocket } from "react-icons/io";

import { IconType } from "react-icons";

interface NewGameTip {
  title: string;
  text: string;
  icon: IconType;
}

const TIPS: NewGameTip[] = [
  {
    title: "Work in Progress",
    text: 'Elara is still under development. If you have any feedback, we\'d love to hear it! Just press the "Feedback" button near the top of the screen.',
    icon: MdConstruction,
  },
  {
    title: "Local Autosave Only",
    text: "Your progress will be automatically saved, but only on this computer and this browser. If you change to a different computer, a different browser, or clear your browser's local storage, your progress will be lost.",
    icon: MdSave,
  },
  {
    title: "Computer Recommended",
    text: "Elara works best on a computer or laptop with a keyboard. You may be able to play on smaller devices like a phone or tablet, but it is not guaranteed to work.",
    icon: FaComputer,
  },
];

export interface NewGameModalProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onProceed?: () => void;
  onCancel?: () => void;
}

export function NewGameModal(props: NewGameModalProps) {
  const [currIndex, setCurrIndex] = useState<number>(0);
  const currTip = useMemo(() => TIPS[currIndex], [currIndex]);

  const onProceed = useCallback(() => {
    props.setVisible(false);
    if (props.onProceed) {
      props.onProceed();
    }
  }, [props]);

  const onCancel = useCallback(() => {
    props.setVisible(false);
    setCurrIndex(0);
    if (props.onCancel) {
      props.onCancel();
    }
  }, [props]);

  const nextTip = useCallback(() => {
    if (currIndex === TIPS.length - 1) {
      onProceed();
      return;
    }
    setCurrIndex((i) => i + 1);
  }, [currIndex, onProceed]);

  const previousTip = useCallback(() => {
    if (currIndex === 0) {
      return;
    }
    setCurrIndex(currIndex - 1);
  }, [currIndex]);

  return (
    <Modal
      isOpen={props.visible}
      onClose={onCancel}
      autoFocus={false}
      closeOnEsc={false}
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent
        w="container.md"
        maxW="100%"
        top={{
          base: "0px",
          "2xl": "24px",
        }}
        my={{
          base: "0px",
          md: "24px",
          lg: "48px",
        }}
        py="24px"
        px="12px"
        position="fixed"
      >
        <ModalCloseButton />
        <ModalBody>
          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            align="center"
          >
            {currTip.title}
          </Text>
          <Box display="inline-block" width="100%" mt="16px" mb="16px">
            {currTip.icon({ size: "96px", style: { margin: "auto" } })}
          </Box>
          <Text
            fontSize={{ base: "md", md: "lg" }}
            mb="32px"
            maxW="80%"
            mx="auto"
            textAlign="center"
          >
            {currTip.text}
          </Text>
        </ModalBody>
        <Box w="100%">
          <Stack direction="row" spacing={4} justify="center" align="center">
            {TIPS.length > 1 && (
              <Button
                colorScheme="black"
                w="96px"
                variant="ghost"
                onClick={previousTip}
                disabled={currIndex === 0}
              >
                <GrFormPreviousLink />
                Back
              </Button>
            )}
            {TIPS.length > 1 &&
              TIPS.map((tip, i) => (
                <Box
                  display="inline-block"
                  key={tip.title}
                  width="8px"
                  height="8px"
                  borderRadius="4px"
                  backgroundColor={i === currIndex ? "blue.500" : "gray"}
                  margin="0 4px"
                />
              ))}{" "}
            <Button
              colorScheme="black"
              variant="ghost"
              onClick={nextTip}
              w="128px"
            >
              {currIndex === TIPS.length - 1 ? "Launch" : "Next"}
              {currIndex === TIPS.length - 1 ? (
                <IoIosRocket size="1.1em" style={{ marginLeft: "0.2em" }} />
              ) : (
                <GrFormNextLink />
              )}
            </Button>
          </Stack>
        </Box>
      </ModalContent>
    </Modal>
  );
}
