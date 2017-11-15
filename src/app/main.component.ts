import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})

export class MainComponent {

  constructor(
    private route: ActivatedRoute,
  ) {}

}