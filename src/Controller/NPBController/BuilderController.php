<?php

namespace App\Controller\NPBController;

use App\IntegrityChecks\PatternValidator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/neo-page-builder', name: 'neo_page_builder_get_', methods: ['POST'])]
class BuilderController extends AbstractController
{
    /**
     * Initialize the neo page builder main element.
     *
     * @return Response
     */
    #[Route('/page', name: 'page')]
    public function page(): Response
    {
        return $this->render('builder/page.html.twig', [
            'fromController' => 'page'
        ]);
    }

    /**
     * Renders the row template with the given iteration and controller name.
     *
     * @param Request $request The request object.
     * @return Response The rendered response.
     *
     * @throws NotFoundHttpException If the row iteration is missing in the request parameters.
     */
    #[Route('/row', name: 'row')]
    public function row(Request $request): Response
    {
        if ($request->request->has('pattern')
            && PatternValidator::patternValidation($request->get('pattern'), 'row')
        ) {
            $iteration = (int) $request->get('iteration');
            return $this->render('builder/row.html.twig', [
                'fromController' => 'row',
                'type' => str_starts_with($request->get('pattern'), 'special-') ? 'special' : $request->get('pattern'),
                'pattern' => PatternValidator::getPatternConfig($request->get('pattern'), 'row'),
                'rowType' => PatternValidator::getPattern($request->get('pattern'), 'row')
            ]);
        } else {
            throw $this->createNotFoundException('Row iteration is missing in parameters');
        }
    }

    /**
     * Renders the section template with the given iteration and controller name.
     *
     * @param Request $request The request object.
     * @return Response The rendered response.
     *
     * @throws NotFoundHttpException If the section iteration is missing in the request parameters.
     */
    #[Route('/section', name: 'section')]
    public function section(Request $request): Response
    {
        if ($request->request->has('pattern')
            && $request->request->has('type')
            && PatternValidator::patternValidation($request->get('pattern'), 'section')
        ) {
            $iteration = (int) $request->get('iteration');
            return $this->render('builder/section.html.twig', [
                'fromController' => 'section',
                'type' => $request->get('type'),
                'pattern' => PatternValidator::getPatternConfig($request->get('pattern'), 'section'),
                'rowType' => PatternValidator::getPattern($request->get('pattern'), 'section'),
                'complexity' => PatternValidator::sectionComplexityLevel($request->get('pattern'))
            ]);
        } else {
            throw $this->createNotFoundException('Section iteration is missing in parameters');
        }
    }

    /**
     * Renders the block template with the given iteration and controller name.
     *
     * @param Request $request The request object.
     * @return Response The rendered response.
     *
     * @throws NotFoundHttpException If the block iteration is missing in the request parameters.
     */
    #[Route('/block', name: 'block')]
    public function block(Request $request): Response
    {
        if ($request->request->has('iteration')
            && $request->request->has('pattern')
            && PatternValidator::patternValidation($request->get('pattern'), 'block')
        ) {

            $iteration = (int) $request->get('iteration');
            return $this->render('builder/block.html.twig', [
                'fromController' => 'block',
                'pattern' => PatternValidator::getPatternConfig($request->get('pattern'), 'block')
            ]);

        } else {
            throw $this->createNotFoundException('Block iteration is missing in parameters');
        }
    }


    /**
     * Renders a fixed modal template based on the provided type.
     *
     * @param Request $request The request object.
     * @return Response The rendered response.
     *
     * @throws NotFoundHttpException If the modal choice is missing in the request parameters or is invalid.
     */
    #[Route('/fixed-modal', name: 'templates_modal')]
    public function fixed_modal(Request $request): Response
    {
        if ($request->request->has('type')
            && in_array($request->get('type'), ['row', 'section', 'block'], true)
        ) {

            $type = $request->get('type');
            $isSpecial = $request->request->has('isSpecial') && $request->get('isSpecial') === 'true';

            return $this->render(sprintf('builder/components/modals/%s.html.twig', $type), compact('isSpecial'));
        } else {
            throw $this->createNotFoundException('Modal choice does not exist.');
        }
    }
}
