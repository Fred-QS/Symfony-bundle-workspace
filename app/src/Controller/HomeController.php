<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/', name: 'app_')]
class HomeController extends AbstractController
{
    /**
     * Index method
     *
     * This method is responsible for rendering the "home/index.html.twig" template
     * with the given parameters and returning a Response object.
     *
     * @return Response The rendered template response
     */
    #[Route('', name: 'home')]
    public function index(): Response
    {
        return $this->render('home/index.html.twig');
    }
}
