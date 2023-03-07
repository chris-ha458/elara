import { Container } from "@chakra-ui/react";
import { useRouteNode, useRouter } from "react-router5";
import { useEffect, useCallback } from "react";

import { TREES } from "../lib/dialog_trees";
import { NAVBAR_HEIGHT } from "../lib/constants";
import { getNextSceneFromRoute } from "../lib/scenes";
import DialogTree from "../components/dialog/dialog_tree";

export default function DialogOverBg() {
  const { route } = useRouteNode("");
  const treeName = route.params.treeName as string | null;
  if (treeName == null) {
    throw new Error("treeName is required");
  }
  const router = useRouter();

  const navigateToNextScene = useCallback(() => {
    const nextScene = getNextSceneFromRoute(route);
    if (nextScene == null) {
      throw new Error("Invalid route");
    }
    router.navigate(nextScene.routeName, nextScene.routeParams ?? {});
  }, [route, router]);

  const currTree = useCallback(() => {
    if (treeName == null) {
      throw new Error("treeName is required");
    }
    const tree = TREES[treeName];
    if (!tree) {
      throw new Error(`DialogTree "${treeName}" not found`);
    }
    return tree;
  }, [treeName]);

  useEffect(() => {
    document.title = `Elara | ${currTree().name}`;
  }, [route, currTree]);

  return (
    <Container
      maxW="container.lg"
      height={`calc(100vh - ${NAVBAR_HEIGHT}px)`}
      pb="20px"
    >
      <DialogTree treeName={treeName} onEnd={navigateToNextScene} />
    </Container>
  );
}
